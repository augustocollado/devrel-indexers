import { Store } from '@subsquid/typeorm-store'
import { DailyMetric, MetricType, Transaction, SmartContract, ActiveWallet, TVLSnapshot } from '../model'
import { Between } from 'typeorm'

export class UnifiedAggregator {
    constructor(private store: Store) {}

    async aggregateLatest(): Promise<void> {

        // Proccess the last 2 days
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - (2 * 24 * 60 * 60 * 1000))

        await this.aggregateDaily(startDate, endDate)
    }

    async aggregateDaily(fromDate: Date, toDate: Date): Promise<void> {
        try {
            await Promise.all([
                this.aggregateTransactions(fromDate, toDate),
                this.aggregateContracts(fromDate, toDate),
                this.aggregateWallets(fromDate, toDate),
                this.aggregateTVL(fromDate, toDate)
            ])
            
            console.log('Unified aggregation completed successfully')
        } catch (error) {
            console.error('Error during unified aggregation:', error)
            throw error
        }
    }

    private async aggregateTransactions(fromDate: Date, toDate: Date): Promise<void> {
        // Get transactions for the date range
        const transactions = await this.store.find(Transaction, {
            where: {
                timestamp: Between(fromDate, toDate)
            }
        })

        console.log(`Found ${transactions.length} transactions for aggregation`)
        if (transactions.length === 0) return

        // Group by date
        const dailyGroups = new Map<string, Transaction[]>()
        transactions.forEach(tx => {
            const dateKey = tx.timestamp.toISOString().split('T')[0]
            if (!dailyGroups.has(dateKey)) {
                dailyGroups.set(dateKey, [])
            }
            dailyGroups.get(dateKey)!.push(tx)
        })

        // Create or update daily metrics
        for (const [dateKey, dayTxs] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.TRANSACTIONS}-${dateKey}`

            let totalValue = BigInt(0)
            let successfulTxs = 0

            dayTxs.forEach(tx => {
                totalValue += BigInt(tx.value)
                if (tx.success) successfulTxs++
            })

            const metric = new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.TRANSACTIONS
            metric.date = date
            metric.count = dayTxs.length
            metric.valueNative = totalValue.toString()
            metric.metadata = {
                successful: successfulTxs,
                failed: dayTxs.length - successfulTxs
            }
            metric.createdAt = new Date()
            metric.updatedAt = new Date()

            console.log(`Saving transaction metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }

    private async aggregateContracts(fromDate: Date, toDate: Date): Promise<void> {
        const contracts = await this.store.find(SmartContract, {
            where: {
                timestamp: Between(fromDate, toDate)
            }
        })

        console.log(`Found ${contracts.length} contracts for aggregation`)
        if (contracts.length === 0) return

        const dailyGroups = new Map<string, SmartContract[]>()
        contracts.forEach(contract => {
            const dateKey = contract.timestamp.toISOString().split('T')[0]
            if (!dailyGroups.has(dateKey)) {
                dailyGroups.set(dateKey, [])
            }
            dailyGroups.get(dateKey)!.push(contract)
        })

        for (const [dateKey, dayContracts] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.DEPLOYED_SMART_CONTRACTS}-${dateKey}`

            const metric = new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.DEPLOYED_SMART_CONTRACTS
            metric.date = date
            metric.count = dayContracts.length
            metric.valueNative = "0"
            metric.createdAt = new Date()
            metric.updatedAt = new Date()

            console.log(`Saving contract metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }

    private async aggregateWallets(fromDate: Date, toDate: Date): Promise<void> {
        const wallets = await this.store.find(ActiveWallet, {
            where: {
                date: Between(fromDate, toDate)
            }
        })

        if (wallets.length === 0) return

        const dailyGroups = new Map<string, ActiveWallet[]>()
        wallets.forEach(wallet => {
            // Converts to Date if it's not already
            const walletDate = wallet.date instanceof Date ? wallet.date : new Date(wallet.date)
            const dateKey = walletDate.toISOString().split('T')[0]
            if (!dailyGroups.has(dateKey)) {
                dailyGroups.set(dateKey, [])
            }
            dailyGroups.get(dateKey)!.push(wallet)
        })

        for (const [dateKey, dayWallets] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.ACTIVE_WALLETS}-${dateKey}`

            let totalValueSent = BigInt(0)
            let totalValueReceived = BigInt(0)
            let totalGasUsed = BigInt(0)

            dayWallets.forEach(wallet => {
                totalValueSent += BigInt(wallet.totalValueSent)
                totalValueReceived += BigInt(wallet.totalValueReceived)
                totalGasUsed += BigInt(wallet.totalGasUsed)
            })

            const metric = new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.ACTIVE_WALLETS
            metric.date = date
            metric.count = dayWallets.length
            metric.valueNative = totalValueSent.toString()
            metric.metadata = {
                totalValueSent: totalValueSent.toString(),
                totalValueReceived: totalValueReceived.toString(),
                totalGasUsed: totalGasUsed.toString()
            }
            metric.createdAt = new Date()
            metric.updatedAt = new Date()

            console.log(`Saving wallet metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }

    private async aggregateTVL(fromDate: Date, toDate: Date): Promise<void> {
        const tvlSnapshots = await this.store.find(TVLSnapshot, {
            where: {
                timestamp: Between(fromDate, toDate)
            },
            order: {
                blockNumber: 'DESC'
            }
        })

        if (tvlSnapshots.length === 0) return

        // Group by date and get latest snapshot per token per day
        const dailyGroups = new Map<string, Map<string, TVLSnapshot>>()
        
        tvlSnapshots.forEach(snapshot => {
            const dateKey = snapshot.timestamp.toISOString().split('T')[0]
            if (!dailyGroups.has(dateKey)) {
                dailyGroups.set(dateKey, new Map())
            }
            
            const dayMap = dailyGroups.get(dateKey)!
            const existing = dayMap.get(snapshot.tokenAddress)
            if (!existing || snapshot.blockNumber > existing.blockNumber) {
                dayMap.set(snapshot.tokenAddress, snapshot)
            }
        })

        for (const [dateKey, tokenSnapshots] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.TVL}-${dateKey}`

            const metric = new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.TVL
            metric.date = date
            metric.count = tokenSnapshots.size
            metric.valueNative = "0"
            metric.metadata = {
                tokens: Array.from(tokenSnapshots.keys())
            }
            metric.createdAt = new Date()
            metric.updatedAt = new Date()

            console.log(`Saving TVL metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }
}
import { Store } from '@subsquid/typeorm-store'
import { DailyMetric, MetricType, Transaction, SmartContract, ActiveWallet, TVLSnapshot } from '../model'
import { Between, In } from 'typeorm'

export class UnifiedAggregator {
    constructor(private store: Store) {}

    async aggregateLatest(): Promise<void> {
        // Get the date range of actual data in the database
        const transactions = await this.store.find(Transaction, {
            order: {
                timestamp: 'ASC'
            },
            take: 1
        })

        if (transactions.length === 0) {
            console.log('No transactions found to aggregate')
            return
        }

        // Start from the earliest transaction date
        const startDate = new Date(transactions[0].timestamp)
        startDate.setHours(0, 0, 0, 0) // Start of day
        
        // End at yesterday 23:59:59 (complete days only)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(23, 59, 59, 999)
        
        // Also process today (incomplete day)
        const endOfToday = new Date()

        console.log(`Aggregating complete days from ${startDate.toISOString()} to ${yesterday.toISOString()}`)
        await this.aggregateDaily(startDate, yesterday)
        
        console.log(`Aggregating today (incomplete) from start of day to now`)
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        await this.aggregateDaily(startOfToday, endOfToday)
    }

    async aggregateDaily(fromDate: Date, toDate: Date): Promise<void> {
        try {
            console.log('Starting transaction aggregation...')
            await this.aggregateTransactions(fromDate, toDate)
            
            console.log('Starting contract aggregation...')
            await this.aggregateContracts(fromDate, toDate)
            
            console.log('Starting wallet aggregation...')
            await this.aggregateWallets(fromDate, toDate)
            
            console.log('Starting TVL aggregation...')
            await this.aggregateTVL(fromDate, toDate)
            
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
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayKey = yesterday.toISOString().split('T')[0]
        
        for (const [dateKey, dayTxs] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.TRANSACTIONS}-${dateKey}`

            // Check if metric already exists
            const existing = await this.store.get(DailyMetric, id)
            const isToday = dateKey === today
            const isYesterday = dateKey === yesterdayKey
            
            // Skip if exists and it's not today or yesterday
            if (existing && !isToday && !isYesterday) {
                console.log(`Transaction metric for ${dateKey} is finalized, skipping`)
                continue
            }

            let totalValue = BigInt(0)
            let successfulTxs = 0

            dayTxs.forEach(tx => {
                totalValue += BigInt(tx.value)
                if (tx.success) successfulTxs++
            })

            const metric = existing || new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.TRANSACTIONS
            metric.date = date
            metric.count = dayTxs.length
            metric.valueNative = totalValue.toString()
            metric.metadata = {
                successful: successfulTxs,
                failed: dayTxs.length - successfulTxs
            }
            if (!existing) {
                metric.createdAt = new Date()
            }
            metric.updatedAt = new Date()

            const action = existing ? 'Updating' : 'Saving'
            console.log(`${action} transaction metric for ${dateKey}:`, metric.id, metric.count)
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

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayKey = yesterday.toISOString().split('T')[0]
        
        for (const [dateKey, dayContracts] of dailyGroups) {
            const date = new Date(dateKey)
            const id = `${MetricType.DEPLOYED_SMART_CONTRACTS}-${dateKey}`

            // Check if metric already exists
            const existing = await this.store.get(DailyMetric, id)
            const isToday = dateKey === today
            const isYesterday = dateKey === yesterdayKey
            
            // Skip if exists and it's not today or yesterday
            if (existing && !isToday && !isYesterday) {
                console.log(`Contract metric for ${dateKey} is finalized, skipping`)
                continue
            }

            const metric = existing || new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.DEPLOYED_SMART_CONTRACTS
            metric.date = date
            metric.count = dayContracts.length
            metric.valueNative = "0"
            if (!existing) {
                metric.createdAt = new Date()
            }
            metric.updatedAt = new Date()

            const action = existing ? 'Updating' : 'Saving'
            console.log(`${action} contract metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }

    private async aggregateWallets(fromDate: Date, toDate: Date): Promise<void> {
        // Query transactions to find which wallets were active each day
        const transactions = await this.store.find(Transaction, {
            where: {
                timestamp: Between(fromDate, toDate)
            }
        })

        if (transactions.length === 0) return

        // Group transactions by date and wallet address
        const dailyWalletActivity = new Map<string, Set<string>>()
        transactions.forEach(tx => {
            const txDate = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)
            const dateKey = txDate.toISOString().split('T')[0]
            
            if (!dailyWalletActivity.has(dateKey)) {
                dailyWalletActivity.set(dateKey, new Set<string>())
            }
            dailyWalletActivity.get(dateKey)!.add(tx.from)
        })

        // Load all active wallets to access their metadata
        const allWalletAddresses = Array.from(
            new Set(transactions.map(tx => tx.from))
        )
        const wallets = await this.store.findBy(ActiveWallet, {
            id: In(allWalletAddresses)
        })
        const walletMap = new Map(wallets.map(w => [w.id, w]))

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayKey = yesterday.toISOString().split('T')[0]
        
        for (const [dateKey, activeWalletAddresses] of dailyWalletActivity) {
            const date = new Date(dateKey)
            const id = `${MetricType.ACTIVE_WALLETS}-${dateKey}`

            // Check if metric already exists
            const existing = await this.store.get(DailyMetric, id)
            const isToday = dateKey === today
            const isYesterday = dateKey === yesterdayKey
            
            // Skip if exists and it's not today or yesterday
            if (existing && !isToday && !isYesterday) {
                console.log(`Wallet metric for ${dateKey} is finalized, skipping`)
                continue
            }

            let totalValueSent = BigInt(0)
            let totalValueReceived = BigInt(0)
            let totalGasUsed = BigInt(0)

            // Aggregate values from the wallets that were active on this day
            for (const address of activeWalletAddresses) {
                const wallet = walletMap.get(address)
                if (wallet) {
                    totalValueSent += BigInt(wallet.totalValueSent)
                    totalValueReceived += BigInt(wallet.totalValueReceived)
                    totalGasUsed += BigInt(wallet.totalGasUsed)
                }
            }

            const metric = existing || new DailyMetric()
            metric.id = id
            metric.metricType = MetricType.ACTIVE_WALLETS
            metric.date = date
            metric.count = activeWalletAddresses.size
            metric.valueNative = totalValueSent.toString()
            metric.metadata = {
                totalValueSent: totalValueSent.toString(),
                totalValueReceived: totalValueReceived.toString(),
                totalGasUsed: totalGasUsed.toString()
            }
            if (!existing) {
                metric.createdAt = new Date()
            }
            metric.updatedAt = new Date()

            const action = existing ? 'Updating' : 'Saving'
            console.log(`${action} wallet metric for ${dateKey}:`, metric.id, metric.count)
            await this.store.save(metric)
        }
    }

    private async aggregateTVL(fromDate: Date, toDate: Date): Promise<void> {
        try {
            console.log(`Aggregating TVL from ${fromDate.toISOString()} to ${toDate.toISOString()}`)
            
            const tvlSnapshots = await this.store.find(TVLSnapshot, {
                where: {
                    timestamp: Between(fromDate, toDate)
                },
                order: {
                    blockNumber: 'DESC'
                }
            })

            console.log(`Found ${tvlSnapshots.length} TVL snapshots for aggregation`)
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

            const today = new Date().toISOString().split('T')[0]
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayKey = yesterday.toISOString().split('T')[0]
        
            for (const [dateKey, tokenSnapshots] of dailyGroups) {
                const date = new Date(dateKey)
                const id = `${MetricType.TVL}-${dateKey}`

                // Check if metric already exists
                const existing = await this.store.get(DailyMetric, id)
                const isToday = dateKey === today
                const isYesterday = dateKey === yesterdayKey
                
                // Skip if exists and it's not today or yesterday
                if (existing && !isToday && !isYesterday) {
                    console.log(`TVL metric for ${dateKey} is finalized, skipping`)
                    continue
                }

                const metric = existing || new DailyMetric()
                metric.id = id
                metric.metricType = MetricType.TVL
                metric.date = date
                metric.count = tokenSnapshots.size
                metric.valueNative = "0"
                metric.metadata = {
                    tokens: Array.from(tokenSnapshots.keys())
                }
                if (!existing) {
                    metric.createdAt = new Date()
                }
                metric.updatedAt = new Date()

                const action = existing ? 'Updating' : 'Saving'
                console.log(`${action} TVL metric for ${dateKey}:`, metric.id, metric.count)
                await this.store.save(metric)
            }
            console.log('TVL aggregation completed successfully')
        } catch (error) {
            console.error('Error during TVL aggregation:', error)
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    dateRange: `${fromDate.toISOString()} to ${toDate.toISOString()}`
                })
            }
            // Re-throw to let processor handle retry logic
            throw error
        }
    }
}
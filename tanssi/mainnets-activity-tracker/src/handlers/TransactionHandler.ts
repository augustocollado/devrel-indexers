import { Store } from '@subsquid/typeorm-store'
import { Transaction, SmartContract, ActiveWallet } from '../model'

export class TransactionHandler {
    async process(ctx: { store: Store }, blocks: any[]): Promise<void> {
        const transactions: Transaction[] = []
        const contracts: SmartContract[] = []
        const activeWallets = new Map<string, ActiveWallet>()

        for (const { block, transactions: blockTxs } of blocks) {
            for (const tx of blockTxs) {

                // Create transaction record
                const transaction = new Transaction()
                transaction.id = tx.hash
                transaction.from = tx.from.toLowerCase()
                transaction.to = tx.to?.toLowerCase() || null
                transaction.value = tx.value.toString()
                transaction.gasUsed = (tx.gasUsed || tx.gas || 0).toString()
                transaction.blockNumber = block.height
                transaction.timestamp = new Date(block.timestamp)
                transaction.isContractCreation = !tx.to || tx.to === null
                transaction.contractAddress = tx.contractAddress?.toLowerCase() || null
                transaction.success = tx.status === 1
                transactions.push(transaction)

                // Track contract creation
                if ((!tx.to || tx.to === null) && tx.contractAddress) {
                    const contract = new SmartContract()
                    contract.id = tx.contractAddress.toLowerCase()
                    contract.address = tx.contractAddress.toLowerCase()
                    contract.creator = tx.from.toLowerCase()
                    contract.transactionHash = tx.hash
                    contract.blockNumber = block.height
                    contract.timestamp = new Date(block.timestamp)
                    contracts.push(contract)
                }

                // Track active wallets
                const date = new Date(block.timestamp)
                date.setHours(0, 0, 0, 0) // Normalize to day

                // From address
                const fromKey = this.getId(tx.from, date)
                let fromWallet = activeWallets.get(fromKey)
                if (!fromWallet) {
                    fromWallet = this.initializeWallet(tx.from.toLowerCase(), date)
                    activeWallets.set(fromKey, fromWallet)
                }

                fromWallet.transactionCount++
                fromWallet.totalValueSent = (BigInt(fromWallet.totalValueSent) + BigInt(tx.value)).toString()
                fromWallet.totalGasUsed = (BigInt(fromWallet.totalGasUsed) + BigInt(tx.gasUsed || 0)).toString()

                // To address (if exists)
                if (tx.to) {
                    const toKey = this.getId(tx.to, date)
                    let toWallet = activeWallets.get(toKey)
                    if (!toWallet) {
                        toWallet = this.initializeWallet(tx.to.toLowerCase(), date)
                        activeWallets.set(toKey, toWallet)
                    }

                    toWallet.totalValueReceived = (BigInt(toWallet.totalValueReceived) + BigInt(tx.value)).toString()
                }
            }
        }

        // Save all data
        await ctx.store.save([...transactions])
        await ctx.store.save([...contracts])
        await ctx.store.save([...activeWallets.values()])
    }

    private initializeWallet(address: string, date: Date): ActiveWallet {
        const wallet = new ActiveWallet()
        wallet.id = this.getId(address, date)
        wallet.address = address
        wallet.date = date
        wallet.transactionCount = 0
        wallet.totalValueSent = "0"
        wallet.totalValueReceived = "0"
        wallet.totalGasUsed = "0"
        return wallet
    }

    private getId(address: string, date: Date): string {
        return `${address}-${date.toISOString().split('T')[0]}`
    }
}
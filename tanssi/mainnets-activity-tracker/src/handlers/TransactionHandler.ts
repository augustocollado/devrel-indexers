import { Store } from '@subsquid/typeorm-store'
import { Transaction, SmartContract, ActiveWallet } from '../model'

export class TransactionHandler {
    async process(ctx: { store: Store }, blocks: any[]): Promise<void> {
        const transactions: Transaction[] = []
        const contracts: SmartContract[] = []
        const activeWallets = new Map<string, ActiveWallet>()
        const contractAddresses = new Set<string>()

        // First pass: collect all contract addresses
        for (const { block, transactions: blockTxs } of blocks) {
            for (const tx of blockTxs) {
                // Track contract creation addresses
                if ((!tx.to || tx.to === null) && tx.contractAddress) {
                    contractAddresses.add(tx.contractAddress.toLowerCase())
                }
            }
        }

        // Load existing contracts from database to avoid counting them as wallets
        try {
            const toAddresses = blocks.flatMap(({ transactions: blockTxs }) => 
                blockTxs.filter((tx: any) => tx.to).map((tx: any) => tx.to.toLowerCase())
            )
            
            if (toAddresses.length > 0) {
                const uniqueAddresses = [...new Set(toAddresses)]
                const existingContracts = await ctx.store.findBy(SmartContract, {
                    address: uniqueAddresses as any
                })
                existingContracts.forEach(contract => contractAddresses.add(contract.address))
            }
        } catch (error) {
            // Table might not exist yet during first run - that's OK
            console.log('Could not load existing contracts, will only track new ones')
        }

        // Collect all unique wallet addresses we'll be processing
        const walletAddresses = new Set<string>()
        for (const { block, transactions: blockTxs } of blocks) {
            for (const tx of blockTxs) {
                const fromAddress = tx.from.toLowerCase()
                if (!contractAddresses.has(fromAddress)) {
                    walletAddresses.add(fromAddress)
                }
                
                if (tx.to) {
                    const toAddress = tx.to.toLowerCase()
                    if (!contractAddresses.has(toAddress)) {
                        walletAddresses.add(toAddress)
                    }
                }
            }
        }

        // Load existing wallets from database to merge with new data
        if (walletAddresses.size > 0) {
            const existingWallets = await ctx.store.findBy(ActiveWallet, {
                id: [...walletAddresses] as any
            })
            if (existingWallets.length > 0) {
                console.log(`Loaded ${existingWallets.length} existing wallets for merging`)
            }
            existingWallets.forEach(wallet => {
                activeWallets.set(wallet.id, wallet)
            })
        }

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

                // Track active wallets (only EOA, not smart contracts)
                const txTimestamp = new Date(block.timestamp)

                // From address (only if not a contract)
                const fromAddress = tx.from.toLowerCase()
                if (!contractAddresses.has(fromAddress)) {
                    let fromWallet = activeWallets.get(fromAddress)
                    if (!fromWallet) {
                        fromWallet = this.initializeWallet(fromAddress, txTimestamp)
                        activeWallets.set(fromAddress, fromWallet)
                    }

                    // Update amounts and timestamps
                    fromWallet.totalValueSent = (BigInt(fromWallet.totalValueSent) + BigInt(tx.value)).toString()
                    fromWallet.totalGasUsed = (BigInt(fromWallet.totalGasUsed) + BigInt(tx.gasUsed || 0)).toString()
                    
                    fromWallet.transactionCount = await ctx.store.count(Transaction, {
                        where: { from: fromWallet.id }
                    }) + transactions.filter(t => t.from === fromWallet!.id).length
                
                    // Update lastSeen
                    if (txTimestamp > fromWallet.lastSeen) {
                        fromWallet.lastSeen = txTimestamp
                    }
                }

                // To address (only if exists and not a contract)
                if (tx.to) {
                    const toAddress = tx.to.toLowerCase()
                    if (!contractAddresses.has(toAddress)) {
                        let toWallet = activeWallets.get(toAddress)
                        if (!toWallet) {
                            toWallet = this.initializeWallet(toAddress, txTimestamp)
                            activeWallets.set(toAddress, toWallet)
                        }

                        toWallet.totalValueReceived = (BigInt(toWallet.totalValueReceived) + BigInt(tx.value)).toString()
                        
                        // Update lastSeen
                        if (txTimestamp > toWallet.lastSeen) {
                            toWallet.lastSeen = txTimestamp
                        }
                    }
                }
            }
        }

        // Save all data
        await ctx.store.save([...transactions])
        await ctx.store.save([...contracts])
        await ctx.store.save([...activeWallets.values()])
    }

    private initializeWallet(address: string, timestamp: Date): ActiveWallet {
        const wallet = new ActiveWallet()
        wallet.id = address
        wallet.firstSeen = timestamp
        wallet.lastSeen = timestamp
        wallet.transactionCount = 0
        wallet.totalValueSent = "0"
        wallet.totalValueReceived = "0"
        wallet.totalGasUsed = "0"
        return wallet
    }
}
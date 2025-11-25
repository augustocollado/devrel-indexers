import { assertNotNull, EvmBatchProcessor } from '@subsquid/evm-processor'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { TransactionHandler, TVLHandler } from './handlers'
import { UnifiedAggregator } from './aggregators/UnifiedAggregator'

// Configs
const RPC_ENDPOINT = assertNotNull(process.env.RPC_ENDPOINT)
const START_BLOCK = Number(process.env.START_BLOCK)
const AGGREGATION_INTERVAL_MINUTES = Number(process.env.AGGREGATION_INTERVAL_MINUTES)
const AGGREGATION_INTERVAL_BLOCKS = Math.floor(AGGREGATION_INTERVAL_MINUTES * 60 / 6) // Block time 6s

const processor = new EvmBatchProcessor()
    .setRpcEndpoint({
        url: RPC_ENDPOINT,
    })
    .setFinalityConfirmation(1)
    .setFields({
        block: {
            timestamp: true
        },
        transaction: {
            from: true,
            to: true,
            hash: true,
            value: true,
            gas: true,
            gasUsed: true,
            status: true,
            contractAddress: true,
        },
        log: {
            address: true,
            topics: true,
            data: true,
        },
    })
    .setBlockRange({
        from: START_BLOCK
    })
    .addTransaction({})
    .addLog({})

const db = new TypeormDatabase()

const transactionHandler = new TransactionHandler()
const tvlHandler = new TVLHandler(RPC_ENDPOINT)

let lastAggregationBlock = 0

processor.run(db, async (ctx) => {
    const blocks = ctx.blocks.map((block: any) => ({
        block: block.header,
        transactions: block.transactions,
        logs: block.logs,
    }))

    console.log(`Processing ${blocks.length} blocks: ${blocks[0]?.block.height} to ${blocks[blocks.length - 1]?.block.height}`)

    try {
        // Process raw data
        await transactionHandler.process(ctx, blocks)
        await tvlHandler.process(ctx, blocks)
        
        // Check if it's time to aggregate
        const currentBlock = blocks[blocks.length - 1]?.block.height || 0
        if (currentBlock - lastAggregationBlock >= AGGREGATION_INTERVAL_BLOCKS) {
            console.log(`Running unified aggregation at block ${currentBlock}`)
            
            try {
                const aggregator = new UnifiedAggregator(ctx.store as any)
                await aggregator.aggregateLatest()
                lastAggregationBlock = currentBlock
                console.log(`Aggregation completed for block ${currentBlock}`)
            } catch (error) {
                console.error('Aggregation failed:', error)
            }
        }

        console.log(`Successfully processed ${blocks.length} blocks`)
    } catch (error) {
        console.error('Error processing blocks:', error)
        throw error
    }
})
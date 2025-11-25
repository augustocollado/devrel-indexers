import { BlockHeader, Log } from '@subsquid/evm-processor'
import { Store } from '@subsquid/typeorm-store'
import { TVLSnapshot } from '../model'
import { ethers } from 'ethers'

// ERC20 ABI for getting token info
const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
]

// ERC165 interface ID for ERC20 (0x36372b07)
const ERC165_ABI = [
    "function supportsInterface(bytes4) view returns (bool)"
]

// Check if contract is ERC20 by trying to call decimals() which is unique to ERC20
async function isERC20(contract: ethers.Contract): Promise<boolean> {
    try {
        // ERC20 must have decimals() function
        const decimals = await contract.decimals()
        return typeof decimals === 'number' || typeof decimals === 'bigint'
    } catch {
        return false
    }
}

interface ProcessedBlock {
    block: BlockHeader
    logs: Log[]
}

export class TVLHandler {
    private knownTokens = new Set<string>()
    private provider: ethers.JsonRpcProvider

    constructor(rpcUrl: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl)
    }

    async process(ctx: { store: Store }, blocks: ProcessedBlock[]): Promise<void> {
        const tvlSnapshots: TVLSnapshot[] = []

        for (const { block, logs } of blocks) {
            // Track ERC20 token transfers to identify new tokens
            for (const log of logs) {
                if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                    // Transfer event
                    this.knownTokens.add(log.address.toLowerCase())
                }
            }

            // Sample TVL calculation (this would be more sophisticated in practice)
            for (const tokenAddress of this.knownTokens) {
                try {
                    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
                    
                    // Check if this is actually an ERC20 token
                    const isERC20Token = await isERC20(contract)
                    if (!isERC20Token) {
                        console.log(`Skipping ${tokenAddress} - not an ERC20 token`)
                        continue
                    }
                    
                    const [totalSupply, symbol, decimals] = await Promise.all([
                        contract.totalSupply(),
                        contract.symbol(),
                        contract.decimals()
                    ])

                    const tvlSnapshot = new TVLSnapshot()
                    tvlSnapshot.id = `${tokenAddress}-${block.height}`
                    tvlSnapshot.tokenAddress = tokenAddress.toLowerCase()
                    tvlSnapshot.symbol = symbol
                    tvlSnapshot.decimals = decimals
                    tvlSnapshot.totalSupply = totalSupply.toString()
                    tvlSnapshot.blockNumber = block.height
                    tvlSnapshot.timestamp = new Date(block.timestamp)

                    tvlSnapshots.push(tvlSnapshot)
                } catch (error) {
                    console.log(`Error processing TVL for token ${tokenAddress}:`, error)
                }
            }
        }

        if (tvlSnapshots.length > 0) {
            await ctx.store.save(tvlSnapshots)
        }
    }

    addKnownToken(address: string) {
        this.knownTokens.add(address.toLowerCase())
    }
}
# EVM Chain Indexer

A comprehensive SQD (Subsquid) indexer for tracking EVM chain metrics including transactions, smart contracts, active wallets, and TVL with time-based aggregation capabilities.

## Features

- **EVM-Compatible**: Works with any EVM chain by simply configuring RPC endpoint
- **Comprehensive Metrics**: Track transactions, smart contracts, active wallets, and TVL
- **Unified Processing**: Single process handles both data ingestion and aggregation
- **GraphQL API**: Rich querying capabilities for all indexed data
- **Real-time Processing**: Live indexing with configurable periodic aggregation
- **Docker Deployment**: Easy deployment with Docker Compose

## Tracked Metrics

1. **Transactions**: Total count, value, gas usage, success rate
2. **Smart Contracts**: Deployed contracts, creators, verification status
3. **Active Wallets**: Daily active users, transaction patterns, gas usage
4. **TVL (Total Value Locked)**: Token balances, locked amounts, USD values
5. **Daily Metrics**: Aggregated daily statistics for all metric types

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (handled by Docker)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd evm-chain-indexer
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your chain configuration:

```env
# Chain Configuration
RPC_ENDPOINT=https://services.tanssi-mainnet.network/tanssi-2004
START_BLOCK=0

# Aggregation Configuration
AGGREGATION_INTERVAL_MINUTES=10

# Database (auto-configured for Docker)
DB_HOST=localhost
DB_PORT=23798
DB_NAME=squid
DB_USER=postgres
DB_PASS=postgres

# Server Configuration
GRAPHQL_PORT=4000
PROCESSOR_PROMETHEUS_PORT=3000
```

### 3. Start with Docker

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f processor
docker-compose logs -f graphql
```

### 4. Manual Setup (Development)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Create database schema
npm run db:create
npm run db:migration:generate
npm run db:reset

# Build the project
npm run build

# Start processor (includes aggregation)
npm run process

# In another terminal, start GraphQL server
npm run serve
```

## Chain Configuration

The indexer is configured via environment variables. Simply set your RPC endpoint and starting block:

```env
RPC_ENDPOINT=https://your-chain-rpc-endpoint.com
START_BLOCK=0
AGGREGATION_INTERVAL_MINUTES=10
```

The indexer automatically adapts to any EVM-compatible chain. No additional configuration files needed!

## GraphQL API

Once running, access the GraphQL playground at `http://localhost:4000/graphql`

The API is **automatically generated** from your TypeORM entities in `src/model/`. No schema.graphql file needed!

### Auto-Generated Features:
- CRUD queries for all entities
- Filtering with `where` clauses
- Sorting with `orderBy`
- Pagination with `limit` and `offset`
- Relationships between entities

### Example Queries

#### Get Recent Transactions
```graphql
query {
  transactions(limit: 10, orderBy: blockNumber_DESC) {
    id
    from
    to
    value
    blockNumber
    timestamp
    success
  }
}
```

#### Get Active Wallets
```graphql
query {
  activeWallets(limit: 10) {
    id
    address
    date
    transactionCount
    totalValueSent
    totalValueReceived
  }
}
```

#### Get Daily Metrics
```graphql
query {
  dailyMetrics(orderBy: date_DESC) {
    id
    date
    metricType
    count
    valueNative
    valueUSD
  }
}
```

#### Get TVL Snapshots
```graphql
query {
  tVLSnapshots(limit: 10, orderBy: blockNumber_DESC) {
    id
    tokenAddress
    lockedAmount
    tvlUSD
    blockNumber
    timestamp
  }
}
```

#### Get Smart Contracts
```graphql
query {
  smartContracts(limit: 10, orderBy: deployedAt_DESC) {
    id
    address
    creator
    deployedAt
    deploymentTx
  }
}
```

## Architecture

```
src/
├── model/              # TypeORM entities
│   ├── Transaction.ts
│   ├── SmartContract.ts
│   ├── ActiveWallet.ts
│   ├── TVLSnapshot.ts
│   └── DailyMetric.ts
├── handlers/           # Data processing logic
│   ├── TransactionHandler.ts
│   ├── TVLHandler.ts
│   └── index.ts
├── aggregators/        # Unified aggregation logic
│   ├── UnifiedAggregator.ts
│   └── index.ts
└── processor.ts       # Main SQD processor (includes aggregation)
```

### Processing Flow

The unified processor handles both data ingestion and aggregation:

1. **Block Processing**: Processes EVM blocks in batches using SQD processor
2. **Data Extraction**: TransactionHandler and TVLHandler extract on-chain data
3. **Real-time Storage**: Stores raw data to PostgreSQL via TypeORM
4. **Periodic Aggregation**: Every N blocks (configurable via AGGREGATION_INTERVAL_MINUTES), UnifiedAggregator aggregates daily metrics
5. **GraphQL API**: Auto-generated API from TypeORM entities via @subsquid/graphql-server

## Data Models

### Transaction
- Hash, from/to addresses, value, gas usage
- Block number, timestamp, success status
- Contract creation detection

### SmartContract
- Address, creator, deployment transaction
- Verification status, name, version
- Deployment timestamp and block

### ActiveWallet
- Daily aggregated wallet activity
- Transaction counts, value transferred
- Gas usage patterns

### TVLSnapshot
- Token-specific TVL measurements
- Supply, locked amounts, USD values
- Block-level snapshots

### DailyMetric
- Daily aggregated metrics by type
- Count, native value, USD value
- Metadata for additional context

## Environment Variables

| Variable                       | Description                  | Default     |
|--------------------------------|------------------------------|-------------|
| `RPC_ENDPOINT`                      | Blockchain RPC endpoint      | Required    |
| `START_BLOCK`                  | Starting block number        | `0`         |
| `AGGREGATION_INTERVAL_MINUTES` | Minutes between aggregations | `10`        |
| `DB_HOST`                      | Database hostname            | `localhost` |
| `DB_PORT`                      | Database port                | `23798`     |
| `DB_NAME`                      | Database name                | `squid`     |
| `DB_USER`                      | Database username            | `postgres`  |
| `DB_PASS`                      | Database password            | `postgres`  |
| `GRAPHQL_PORT`                 | GraphQL server port          | `4000`      |
| `PROCESSOR_PROMETHEUS_PORT`    | Prometheus metrics port      | `3000`      |

## Development

### Adding New Metrics

1. Create entity in `src/model/`
2. Add handler in `src/handlers/`
3. Update processor in `src/processor.ts`
4. Run `npm run build` to regenerate types
5. GraphQL API will be auto-generated from entities

### Testing

```bash
# Run processor in development mode
npm run process

# Check GraphQL playground
open http://localhost:4000/graphql

# Monitor logs
docker-compose logs -f
```

## Deployment

### Production Docker Deployment

```bash
# Copy production environment
cp deploy.env .env

# Edit with production values
nano .env

# Deploy
docker-compose -f docker-compose.yml up -d

# Monitor
docker-compose logs -f
```

### Manual Production Deployment

1. Setup PostgreSQL database
2. Configure environment variables
3. Build: `npm run build`
4. Run migrations: `npm run db:reset`
5. Start processor: `npm run process` (includes aggregation)
6. Start GraphQL server: `npm run serve`

## Monitoring

- **Processor logs**: Monitor block processing and errors
- **GraphQL endpoint**: `http://localhost:4000/graphql`
- **Prometheus metrics**: `http://localhost:3000/metrics`
- **Database health**: Check PostgreSQL connection

## Troubleshooting

### Common Issues

1. **RPC connection errors**: Check `RPC_ENDPOINT` and network connectivity
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Missing data**: Check `START_BLOCK` and ensure processor is running
4. **Memory issues**: Consider reducing batch size or increasing container memory

### Performance Optimization

- Adjust `START_BLOCK` to avoid processing unnecessary historical data
- Monitor database size and consider archival strategies
- Use read replicas for GraphQL queries in high-traffic scenarios
- Implement caching for frequently accessed metrics

## License

MIT License

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review configuration in `src/config/chains.ts`
- Verify environment variables in `.env`
- Check Docker Compose logs: `docker-compose logs`
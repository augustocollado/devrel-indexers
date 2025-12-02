import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class ActiveWallet {
    constructor(props?: Partial<ActiveWallet>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @DateTimeColumn_({nullable: false})
    firstSeen!: Date

    @DateTimeColumn_({nullable: false})
    lastSeen!: Date

    @IntColumn_({nullable: false})
    transactionCount!: number

    @StringColumn_({nullable: false})
    totalValueSent!: string

    @StringColumn_({nullable: false})
    totalValueReceived!: string

    @StringColumn_({nullable: false})
    totalGasUsed!: string
}

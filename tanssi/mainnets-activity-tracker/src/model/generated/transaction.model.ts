import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Transaction {
    constructor(props?: Partial<Transaction>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    from!: string

    @Index_()
    @StringColumn_({nullable: true})
    to!: string | undefined | null

    @StringColumn_({nullable: false})
    value!: string

    @StringColumn_({nullable: false})
    gasUsed!: string

    @Index_()
    @IntColumn_({nullable: false})
    blockNumber!: number

    @Index_()
    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @Index_()
    @BooleanColumn_({nullable: false})
    isContractCreation!: boolean

    @Index_()
    @StringColumn_({nullable: true})
    contractAddress!: string | undefined | null

    @BooleanColumn_({nullable: false})
    success!: boolean
}

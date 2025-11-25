import { Entity, PrimaryColumn, Column, Index } from "typeorm"

@Entity()
export class Transaction {
    @PrimaryColumn()
    id!: string // Transaction hash

    @Column("varchar", { length: 42 })
    @Index()
    from!: string

    @Column("varchar", { length: 42, nullable: true })
    @Index()
    to!: string | null

    @Column("numeric", { precision: 78, scale: 0 })
    value!: string

    @Column("numeric", { precision: 78, scale: 0 })
    gasUsed!: string

    @Column("int")
    @Index()
    blockNumber!: number

    @Column("timestamp")
    @Index()
    timestamp!: Date

    @Column("boolean", { default: false })
    @Index()
    isContractCreation!: boolean

    @Column("varchar", { length: 42, nullable: true })
    @Index()
    contractAddress!: string | null

    @Column("boolean")
    success!: boolean
}
import { Entity, PrimaryColumn, Column, Index } from "typeorm"

@Entity()
@Index(["tokenAddress", "blockNumber"])
export class TVLSnapshot {
    @PrimaryColumn()
    id!: string // tokenAddress + blockNumber

    @Column("varchar", { length: 42 })
    tokenAddress!: string

    @Column("varchar", { length: 10 })
    symbol!: string

    @Column("int")
    decimals!: number

    @Column("numeric", { precision: 78, scale: 0 })
    totalSupply!: string

    @Column("int")
    blockNumber!: number

    @Column("timestamp")
    @Index()
    timestamp!: Date
}
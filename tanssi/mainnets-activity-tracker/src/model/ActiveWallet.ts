import { Entity, PrimaryColumn, Column, Index } from "typeorm"

@Entity()
@Index(["address", "date"], { unique: true })
export class ActiveWallet {
    @PrimaryColumn()
    id!: string // address + date

    @Column("varchar", { length: 42 })
    address!: string

    @Column("date")
    date!: Date

    @Column("int", { default: 1 })
    transactionCount!: number

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalValueSent!: string

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalValueReceived!: string

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalGasUsed!: string
}
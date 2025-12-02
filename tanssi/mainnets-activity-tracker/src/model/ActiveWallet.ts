import { Entity, PrimaryColumn, Column } from "typeorm"

@Entity()
export class ActiveWallet {
    @PrimaryColumn("varchar")
    id!: string

    @Column("timestamp")
    firstSeen!: Date

    @Column("timestamp")
    lastSeen!: Date

    @Column("int", { default: 0 })
    transactionCount!: number

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalValueSent!: string

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalValueReceived!: string

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    totalGasUsed!: string
}
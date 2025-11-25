import { Entity, PrimaryColumn, Column, Index } from "typeorm"

@Entity()
export class SmartContract {
    @PrimaryColumn()
    id!: string // Contract address

    @Column("varchar", { length: 42 })
    @Index()
    address!: string

    @Column("varchar", { length: 42 })
    @Index()
    creator!: string

    @Column("varchar", { length: 66 })
    @Index()
    transactionHash!: string

    @Column("int")
    @Index()
    blockNumber!: number

    @Column("timestamp")
    @Index()
    timestamp!: Date
}
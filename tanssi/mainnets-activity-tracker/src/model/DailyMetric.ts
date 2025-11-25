import { Entity, PrimaryColumn, Column, Index } from "typeorm"

export enum MetricType {
    TRANSACTIONS = "TRANSACTIONS",
    DEPLOYED_SMART_CONTRACTS = "DEPLOYED_SMART_CONTRACTS", 
    ACTIVE_WALLETS = "ACTIVE_WALLETS",
    TVL = "TVL"
}

@Entity()
@Index(["metricType", "date"], { unique: true })
export class DailyMetric {
    @PrimaryColumn()
    id!: string // metricType + date

    @Column("enum", { enum: MetricType })
    metricType!: MetricType

    @Column("date")
    date!: Date

    @Column("int", { default: 0 })
    count!: number

    @Column("numeric", { precision: 78, scale: 0, default: "0" })
    valueNative!: string

    @Column("json", { nullable: true })
    metadata!: any

    @Column("timestamp")
    createdAt!: Date

    @Column("timestamp")
    updatedAt!: Date
}
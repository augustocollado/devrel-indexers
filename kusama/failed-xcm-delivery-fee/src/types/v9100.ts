import {sts, Result, Option, Bytes, BitSequence} from './support'

export const Outcome: sts.Type<Outcome> = sts.closedEnum(() => {
    return  {
        Complete: Weight,
        Error: XcmErrorV0,
        Incomplete: sts.tuple(() => [Weight, XcmErrorV0]),
    }
})

export const XcmErrorV0: sts.Type<XcmErrorV0> = sts.closedEnum(() => {
    return  {
        AssetNotFound: sts.unit(),
        BadOrigin: sts.unit(),
        Barrier: sts.unit(),
        CannotReachDestination: sts.tuple(() => [MultiLocation, Xcm]),
        DestinationBufferOverflow: sts.unit(),
        EscalationOfPrivilege: sts.unit(),
        ExceedsMaxMessageSize: sts.unit(),
        FailedToDecode: sts.unit(),
        FailedToTransactAsset: sts.unit(),
        LocationCannotHold: sts.unit(),
        MultiLocationFull: sts.unit(),
        NotHoldingFees: sts.unit(),
        NotWithdrawable: sts.unit(),
        Overflow: sts.unit(),
        RecursionLimitReached: sts.unit(),
        SendFailed: sts.unit(),
        TooExpensive: sts.unit(),
        TooMuchWeightRequired: sts.unit(),
        Undefined: sts.unit(),
        UnhandledEffect: sts.unit(),
        UnhandledXcmMessage: sts.unit(),
        UnhandledXcmVersion: sts.unit(),
        Unimplemented: sts.unit(),
        UntrustedReserveLocation: sts.unit(),
        UntrustedTeleportLocation: sts.unit(),
        WeightLimitReached: Weight,
        WeightNotComputable: sts.unit(),
        Wildcard: sts.unit(),
    }
})

export const Xcm: sts.Type<Xcm> = sts.closedEnum(() => {
    return  {
        HrmpChannelAccepted: sts.enumStruct({
            recipient: sts.number(),
        }),
        HrmpChannelClosing: sts.enumStruct({
            initiator: sts.number(),
            sender: sts.number(),
            recipient: sts.number(),
        }),
        HrmpNewChannelOpenRequest: sts.enumStruct({
            sender: sts.number(),
            maxMessageSize: sts.number(),
            maxCapacity: sts.number(),
        }),
        QueryResponse: sts.enumStruct({
            queryId: sts.bigint(),
            response: ResponseV1,
        }),
        ReceiveTeleportedAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
        RelayedFrom: sts.enumStruct({
            who: MultiLocationV1,
            message: XcmV1,
        }),
        ReserveAssetDeposit: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
        Transact: sts.enumStruct({
            originType: XcmOriginKind,
            requireWeightAtMost: sts.bigint(),
            call: DoubleEncodedCall,
        }),
        TransferAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            dest: MultiLocationV1,
        }),
        TransferReserveAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            dest: MultiLocationV1,
            effects: sts.array(() => XcmOrderV1),
        }),
        WithdrawAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
    }
})

export const DoubleEncodedCall: sts.Type<DoubleEncodedCall> = sts.struct(() => {
    return  {
        encoded: sts.bytes(),
    }
})

export interface DoubleEncodedCall {
    encoded: Bytes
}

export const XcmOriginKind: sts.Type<XcmOriginKind> = sts.closedEnum(() => {
    return  {
        Native: sts.unit(),
        SovereignAccount: sts.unit(),
        Superuser: sts.unit(),
        Xcm: sts.unit(),
    }
})

export type XcmOriginKind = XcmOriginKind_Native | XcmOriginKind_SovereignAccount | XcmOriginKind_Superuser | XcmOriginKind_Xcm

export interface XcmOriginKind_Native {
    __kind: 'Native'
}

export interface XcmOriginKind_SovereignAccount {
    __kind: 'SovereignAccount'
}

export interface XcmOriginKind_Superuser {
    __kind: 'Superuser'
}

export interface XcmOriginKind_Xcm {
    __kind: 'Xcm'
}

export const XcmV1: sts.Type<XcmV1> = sts.closedEnum(() => {
    return  {
        HrmpChannelAccepted: sts.enumStruct({
            recipient: sts.number(),
        }),
        HrmpChannelClosing: sts.enumStruct({
            initiator: sts.number(),
            sender: sts.number(),
            recipient: sts.number(),
        }),
        HrmpNewChannelOpenRequest: sts.enumStruct({
            sender: sts.number(),
            maxMessageSize: sts.number(),
            maxCapacity: sts.number(),
        }),
        QueryResponse: sts.enumStruct({
            queryId: sts.bigint(),
            response: ResponseV1,
        }),
        ReceiveTeleportedAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
        RelayedFrom: sts.enumStruct({
            who: MultiLocationV1,
            message: XcmV1,
        }),
        ReserveAssetDeposit: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
        Transact: sts.enumStruct({
            originType: XcmOriginKind,
            requireWeightAtMost: sts.bigint(),
            call: DoubleEncodedCall,
        }),
        TransferAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            dest: MultiLocationV1,
        }),
        TransferReserveAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            dest: MultiLocationV1,
            effects: sts.array(() => XcmOrderV1),
        }),
        WithdrawAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            effects: sts.array(() => XcmOrderV1),
        }),
    }
})

export type XcmV1 = XcmV1_HrmpChannelAccepted | XcmV1_HrmpChannelClosing | XcmV1_HrmpNewChannelOpenRequest | XcmV1_QueryResponse | XcmV1_ReceiveTeleportedAsset | XcmV1_RelayedFrom | XcmV1_ReserveAssetDeposit | XcmV1_Transact | XcmV1_TransferAsset | XcmV1_TransferReserveAsset | XcmV1_WithdrawAsset

export interface XcmV1_HrmpChannelAccepted {
    __kind: 'HrmpChannelAccepted'
    recipient: number
}

export interface XcmV1_HrmpChannelClosing {
    __kind: 'HrmpChannelClosing'
    initiator: number
    sender: number
    recipient: number
}

export interface XcmV1_HrmpNewChannelOpenRequest {
    __kind: 'HrmpNewChannelOpenRequest'
    sender: number
    maxMessageSize: number
    maxCapacity: number
}

export interface XcmV1_QueryResponse {
    __kind: 'QueryResponse'
    queryId: bigint
    response: ResponseV1
}

export interface XcmV1_ReceiveTeleportedAsset {
    __kind: 'ReceiveTeleportedAsset'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export interface XcmV1_RelayedFrom {
    __kind: 'RelayedFrom'
    who: MultiLocationV1
    message: XcmV1
}

export interface XcmV1_ReserveAssetDeposit {
    __kind: 'ReserveAssetDeposit'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export interface XcmV1_Transact {
    __kind: 'Transact'
    originType: XcmOriginKind
    requireWeightAtMost: bigint
    call: DoubleEncodedCall
}

export interface XcmV1_TransferAsset {
    __kind: 'TransferAsset'
    assets: MultiAssetV1[]
    dest: MultiLocationV1
}

export interface XcmV1_TransferReserveAsset {
    __kind: 'TransferReserveAsset'
    assets: MultiAssetV1[]
    dest: MultiLocationV1
    effects: XcmOrderV1[]
}

export interface XcmV1_WithdrawAsset {
    __kind: 'WithdrawAsset'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export interface MultiLocationV1 {
    parents: number
    interior: JunctionsV1
}

export type JunctionsV1 = JunctionsV1_Here | JunctionsV1_X1 | JunctionsV1_X2 | JunctionsV1_X3 | JunctionsV1_X4 | JunctionsV1_X5 | JunctionsV1_X6 | JunctionsV1_X7 | JunctionsV1_X8

export interface JunctionsV1_Here {
    __kind: 'Here'
}

export interface JunctionsV1_X1 {
    __kind: 'X1'
    value: JunctionV1
}

export interface JunctionsV1_X2 {
    __kind: 'X2'
    value: [JunctionV1, JunctionV1]
}

export interface JunctionsV1_X3 {
    __kind: 'X3'
    value: [JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X4 {
    __kind: 'X4'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X5 {
    __kind: 'X5'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X6 {
    __kind: 'X6'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X7 {
    __kind: 'X7'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X8 {
    __kind: 'X8'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export type JunctionV1 = JunctionV1_AccountId32 | JunctionV1_AccountIndex64 | JunctionV1_AccountKey20 | JunctionV1_GeneralIndex | JunctionV1_GeneralKey | JunctionV1_OnlyChild | JunctionV1_PalletInstance | JunctionV1_Parachain | JunctionV1_Plurality

export interface JunctionV1_AccountId32 {
    __kind: 'AccountId32'
    network: NetworkId
    id: AccountId
}

export interface JunctionV1_AccountIndex64 {
    __kind: 'AccountIndex64'
    network: NetworkId
    index: bigint
}

export interface JunctionV1_AccountKey20 {
    __kind: 'AccountKey20'
    network: NetworkId
    key: Bytes
}

export interface JunctionV1_GeneralIndex {
    __kind: 'GeneralIndex'
    value: bigint
}

export interface JunctionV1_GeneralKey {
    __kind: 'GeneralKey'
    value: Bytes
}

export interface JunctionV1_OnlyChild {
    __kind: 'OnlyChild'
}

export interface JunctionV1_PalletInstance {
    __kind: 'PalletInstance'
    value: number
}

export interface JunctionV1_Parachain {
    __kind: 'Parachain'
    value: number
}

export interface JunctionV1_Plurality {
    __kind: 'Plurality'
    id: BodyId
    part: BodyPart
}

export type BodyPart = BodyPart_AtLeastProportion | BodyPart_Fraction | BodyPart_Members | BodyPart_MoreThanProportion | BodyPart_Voice

export interface BodyPart_AtLeastProportion {
    __kind: 'AtLeastProportion'
    nom: number
    denom: number
}

export interface BodyPart_Fraction {
    __kind: 'Fraction'
    nom: number
    denom: number
}

export interface BodyPart_Members {
    __kind: 'Members'
    value: number
}

export interface BodyPart_MoreThanProportion {
    __kind: 'MoreThanProportion'
    nom: number
    denom: number
}

export interface BodyPart_Voice {
    __kind: 'Voice'
}

export type BodyId = BodyId_Executive | BodyId_Index | BodyId_Judicial | BodyId_Legislative | BodyId_Named | BodyId_Technical | BodyId_Unit

export interface BodyId_Executive {
    __kind: 'Executive'
}

export interface BodyId_Index {
    __kind: 'Index'
    value: number
}

export interface BodyId_Judicial {
    __kind: 'Judicial'
}

export interface BodyId_Legislative {
    __kind: 'Legislative'
}

export interface BodyId_Named {
    __kind: 'Named'
    value: Bytes
}

export interface BodyId_Technical {
    __kind: 'Technical'
}

export interface BodyId_Unit {
    __kind: 'Unit'
}

export type AccountId = Bytes

export type NetworkId = NetworkId_Any | NetworkId_Kusama | NetworkId_Named | NetworkId_Polkadot

export interface NetworkId_Any {
    __kind: 'Any'
}

export interface NetworkId_Kusama {
    __kind: 'Kusama'
}

export interface NetworkId_Named {
    __kind: 'Named'
    value: Bytes
}

export interface NetworkId_Polkadot {
    __kind: 'Polkadot'
}

export type XcmOrderV1 = XcmOrderV1_BuyExecution | XcmOrderV1_DepositAsset | XcmOrderV1_DepositReserveAsset | XcmOrderV1_ExchangeAsset | XcmOrderV1_InitiateReserveWithdraw | XcmOrderV1_InitiateTeleport | XcmOrderV1_Noop | XcmOrderV1_QueryHolding

export interface XcmOrderV1_BuyExecution {
    __kind: 'BuyExecution'
    fees: MultiAssetV1
    weight: bigint
    debt: bigint
    haltOnError: boolean
    instructions: XcmV1[]
}

export interface XcmOrderV1_DepositAsset {
    __kind: 'DepositAsset'
    assets: MultiAssetFilterV1
    maxAssets: number
    beneficiary: MultiLocationV1
}

export interface XcmOrderV1_DepositReserveAsset {
    __kind: 'DepositReserveAsset'
    assets: MultiAssetFilterV1
    maxAssets: number
    dest: MultiLocationV1
    effects: XcmOrderV1[]
}

export interface XcmOrderV1_ExchangeAsset {
    __kind: 'ExchangeAsset'
    give: MultiAssetFilterV1
    receive: MultiAssetV1[]
}

export interface XcmOrderV1_InitiateReserveWithdraw {
    __kind: 'InitiateReserveWithdraw'
    assets: MultiAssetFilterV1
    reserve: MultiLocationV1
    effects: XcmOrderV1[]
}

export interface XcmOrderV1_InitiateTeleport {
    __kind: 'InitiateTeleport'
    assets: MultiAssetFilterV1
    dest: MultiLocationV1
    effects: XcmOrderV1[]
}

export interface XcmOrderV1_Noop {
    __kind: 'Noop'
}

export interface XcmOrderV1_QueryHolding {
    __kind: 'QueryHolding'
    queryId: bigint
    dest: MultiLocationV1
    assets: MultiAssetFilterV1
}

export type MultiAssetFilterV1 = MultiAssetFilterV1_Definite | MultiAssetFilterV1_Wild

export interface MultiAssetFilterV1_Definite {
    __kind: 'Definite'
    value: MultiAssetV1[]
}

export interface MultiAssetFilterV1_Wild {
    __kind: 'Wild'
    value: WildMultiAssetV1
}

export type WildMultiAssetV1 = WildMultiAssetV1_All | WildMultiAssetV1_AllOf

export interface WildMultiAssetV1_All {
    __kind: 'All'
}

export interface WildMultiAssetV1_AllOf {
    __kind: 'AllOf'
    id: XcmAssetId
    fungibility: WildFungibilityV1
}

export type WildFungibilityV1 = WildFungibilityV1_Fungible | WildFungibilityV1_NonFungible

export interface WildFungibilityV1_Fungible {
    __kind: 'Fungible'
}

export interface WildFungibilityV1_NonFungible {
    __kind: 'NonFungible'
}

export type XcmAssetId = XcmAssetId_Abstract | XcmAssetId_Concrete

export interface XcmAssetId_Abstract {
    __kind: 'Abstract'
    value: Bytes
}

export interface XcmAssetId_Concrete {
    __kind: 'Concrete'
    value: MultiLocation
}

export interface MultiLocation {
    parents: number
    interior: JunctionsV1
}

export interface MultiAssetV1 {
    id: XcmAssetId
    fungibility: FungibilityV1
}

export type FungibilityV1 = FungibilityV1_Fungible | FungibilityV1_NonFungible

export interface FungibilityV1_Fungible {
    __kind: 'Fungible'
    value: bigint
}

export interface FungibilityV1_NonFungible {
    __kind: 'NonFungible'
    value: AssetInstanceV1
}

export type AssetInstanceV1 = AssetInstanceV1_Array16 | AssetInstanceV1_Array32 | AssetInstanceV1_Array4 | AssetInstanceV1_Array8 | AssetInstanceV1_Blob | AssetInstanceV1_Index | AssetInstanceV1_Undefined

export interface AssetInstanceV1_Array16 {
    __kind: 'Array16'
    value: Bytes
}

export interface AssetInstanceV1_Array32 {
    __kind: 'Array32'
    value: Bytes
}

export interface AssetInstanceV1_Array4 {
    __kind: 'Array4'
    value: Bytes
}

export interface AssetInstanceV1_Array8 {
    __kind: 'Array8'
    value: Bytes
}

export interface AssetInstanceV1_Blob {
    __kind: 'Blob'
    value: Bytes
}

export interface AssetInstanceV1_Index {
    __kind: 'Index'
    value: bigint
}

export interface AssetInstanceV1_Undefined {
    __kind: 'Undefined'
}

export type ResponseV1 = ResponseV1_Assets

export interface ResponseV1_Assets {
    __kind: 'Assets'
    value: MultiAssetV1[]
}

export const MultiLocationV1: sts.Type<MultiLocationV1> = sts.struct(() => {
    return  {
        parents: sts.number(),
        interior: JunctionsV1,
    }
})

export const JunctionsV1: sts.Type<JunctionsV1> = sts.closedEnum(() => {
    return  {
        Here: sts.unit(),
        X1: JunctionV1,
        X2: sts.tuple(() => [JunctionV1, JunctionV1]),
        X3: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1]),
        X4: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X5: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X6: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X7: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X8: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
    }
})

export const JunctionV1: sts.Type<JunctionV1> = sts.closedEnum(() => {
    return  {
        AccountId32: sts.enumStruct({
            network: NetworkId,
            id: AccountId,
        }),
        AccountIndex64: sts.enumStruct({
            network: NetworkId,
            index: sts.bigint(),
        }),
        AccountKey20: sts.enumStruct({
            network: NetworkId,
            key: sts.bytes(),
        }),
        GeneralIndex: sts.bigint(),
        GeneralKey: sts.bytes(),
        OnlyChild: sts.unit(),
        PalletInstance: sts.number(),
        Parachain: sts.number(),
        Plurality: sts.enumStruct({
            id: BodyId,
            part: BodyPart,
        }),
    }
})

export const BodyPart: sts.Type<BodyPart> = sts.closedEnum(() => {
    return  {
        AtLeastProportion: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Fraction: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Members: sts.number(),
        MoreThanProportion: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Voice: sts.unit(),
    }
})

export const BodyId: sts.Type<BodyId> = sts.closedEnum(() => {
    return  {
        Executive: sts.unit(),
        Index: sts.number(),
        Judicial: sts.unit(),
        Legislative: sts.unit(),
        Named: sts.bytes(),
        Technical: sts.unit(),
        Unit: sts.unit(),
    }
})

export const AccountId = sts.bytes()

export const NetworkId: sts.Type<NetworkId> = sts.closedEnum(() => {
    return  {
        Any: sts.unit(),
        Kusama: sts.unit(),
        Named: sts.bytes(),
        Polkadot: sts.unit(),
    }
})

export const XcmOrderV1: sts.Type<XcmOrderV1> = sts.closedEnum(() => {
    return  {
        BuyExecution: sts.enumStruct({
            fees: MultiAssetV1,
            weight: sts.bigint(),
            debt: sts.bigint(),
            haltOnError: sts.boolean(),
            instructions: sts.array(() => XcmV1),
        }),
        DepositAsset: sts.enumStruct({
            assets: MultiAssetFilterV1,
            maxAssets: sts.number(),
            beneficiary: MultiLocationV1,
        }),
        DepositReserveAsset: sts.enumStruct({
            assets: MultiAssetFilterV1,
            maxAssets: sts.number(),
            dest: MultiLocationV1,
            effects: sts.array(() => XcmOrderV1),
        }),
        ExchangeAsset: sts.enumStruct({
            give: MultiAssetFilterV1,
            receive: sts.array(() => MultiAssetV1),
        }),
        InitiateReserveWithdraw: sts.enumStruct({
            assets: MultiAssetFilterV1,
            reserve: MultiLocationV1,
            effects: sts.array(() => XcmOrderV1),
        }),
        InitiateTeleport: sts.enumStruct({
            assets: MultiAssetFilterV1,
            dest: MultiLocationV1,
            effects: sts.array(() => XcmOrderV1),
        }),
        Noop: sts.unit(),
        QueryHolding: sts.enumStruct({
            queryId: sts.bigint(),
            dest: MultiLocationV1,
            assets: MultiAssetFilterV1,
        }),
    }
})

export const MultiAssetFilterV1: sts.Type<MultiAssetFilterV1> = sts.closedEnum(() => {
    return  {
        Definite: sts.array(() => MultiAssetV1),
        Wild: WildMultiAssetV1,
    }
})

export const WildMultiAssetV1: sts.Type<WildMultiAssetV1> = sts.closedEnum(() => {
    return  {
        All: sts.unit(),
        AllOf: sts.enumStruct({
            id: XcmAssetId,
            fungibility: WildFungibilityV1,
        }),
    }
})

export const WildFungibilityV1: sts.Type<WildFungibilityV1> = sts.closedEnum(() => {
    return  {
        Fungible: sts.unit(),
        NonFungible: sts.unit(),
    }
})

export const XcmAssetId: sts.Type<XcmAssetId> = sts.closedEnum(() => {
    return  {
        Abstract: sts.bytes(),
        Concrete: MultiLocation,
    }
})

export const MultiAssetV1: sts.Type<MultiAssetV1> = sts.struct(() => {
    return  {
        id: XcmAssetId,
        fungibility: FungibilityV1,
    }
})

export const FungibilityV1: sts.Type<FungibilityV1> = sts.closedEnum(() => {
    return  {
        Fungible: sts.bigint(),
        NonFungible: AssetInstanceV1,
    }
})

export const AssetInstanceV1: sts.Type<AssetInstanceV1> = sts.closedEnum(() => {
    return  {
        Array16: sts.bytes(),
        Array32: sts.bytes(),
        Array4: sts.bytes(),
        Array8: sts.bytes(),
        Blob: sts.bytes(),
        Index: sts.bigint(),
        Undefined: sts.unit(),
    }
})

export const ResponseV1: sts.Type<ResponseV1> = sts.closedEnum(() => {
    return  {
        Assets: sts.array(() => MultiAssetV1),
    }
})

export type Xcm = Xcm_HrmpChannelAccepted | Xcm_HrmpChannelClosing | Xcm_HrmpNewChannelOpenRequest | Xcm_QueryResponse | Xcm_ReceiveTeleportedAsset | Xcm_RelayedFrom | Xcm_ReserveAssetDeposit | Xcm_Transact | Xcm_TransferAsset | Xcm_TransferReserveAsset | Xcm_WithdrawAsset

export interface Xcm_HrmpChannelAccepted {
    __kind: 'HrmpChannelAccepted'
    recipient: number
}

export interface Xcm_HrmpChannelClosing {
    __kind: 'HrmpChannelClosing'
    initiator: number
    sender: number
    recipient: number
}

export interface Xcm_HrmpNewChannelOpenRequest {
    __kind: 'HrmpNewChannelOpenRequest'
    sender: number
    maxMessageSize: number
    maxCapacity: number
}

export interface Xcm_QueryResponse {
    __kind: 'QueryResponse'
    queryId: bigint
    response: ResponseV1
}

export interface Xcm_ReceiveTeleportedAsset {
    __kind: 'ReceiveTeleportedAsset'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export interface Xcm_RelayedFrom {
    __kind: 'RelayedFrom'
    who: MultiLocationV1
    message: XcmV1
}

export interface Xcm_ReserveAssetDeposit {
    __kind: 'ReserveAssetDeposit'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export interface Xcm_Transact {
    __kind: 'Transact'
    originType: XcmOriginKind
    requireWeightAtMost: bigint
    call: DoubleEncodedCall
}

export interface Xcm_TransferAsset {
    __kind: 'TransferAsset'
    assets: MultiAssetV1[]
    dest: MultiLocationV1
}

export interface Xcm_TransferReserveAsset {
    __kind: 'TransferReserveAsset'
    assets: MultiAssetV1[]
    dest: MultiLocationV1
    effects: XcmOrderV1[]
}

export interface Xcm_WithdrawAsset {
    __kind: 'WithdrawAsset'
    assets: MultiAssetV1[]
    effects: XcmOrderV1[]
}

export const MultiLocation: sts.Type<MultiLocation> = sts.struct(() => {
    return  {
        parents: sts.number(),
        interior: JunctionsV1,
    }
})

export type XcmErrorV0 = XcmErrorV0_AssetNotFound | XcmErrorV0_BadOrigin | XcmErrorV0_Barrier | XcmErrorV0_CannotReachDestination | XcmErrorV0_DestinationBufferOverflow | XcmErrorV0_EscalationOfPrivilege | XcmErrorV0_ExceedsMaxMessageSize | XcmErrorV0_FailedToDecode | XcmErrorV0_FailedToTransactAsset | XcmErrorV0_LocationCannotHold | XcmErrorV0_MultiLocationFull | XcmErrorV0_NotHoldingFees | XcmErrorV0_NotWithdrawable | XcmErrorV0_Overflow | XcmErrorV0_RecursionLimitReached | XcmErrorV0_SendFailed | XcmErrorV0_TooExpensive | XcmErrorV0_TooMuchWeightRequired | XcmErrorV0_Undefined | XcmErrorV0_UnhandledEffect | XcmErrorV0_UnhandledXcmMessage | XcmErrorV0_UnhandledXcmVersion | XcmErrorV0_Unimplemented | XcmErrorV0_UntrustedReserveLocation | XcmErrorV0_UntrustedTeleportLocation | XcmErrorV0_WeightLimitReached | XcmErrorV0_WeightNotComputable | XcmErrorV0_Wildcard

export interface XcmErrorV0_AssetNotFound {
    __kind: 'AssetNotFound'
}

export interface XcmErrorV0_BadOrigin {
    __kind: 'BadOrigin'
}

export interface XcmErrorV0_Barrier {
    __kind: 'Barrier'
}

export interface XcmErrorV0_CannotReachDestination {
    __kind: 'CannotReachDestination'
    value: [MultiLocation, Xcm]
}

export interface XcmErrorV0_DestinationBufferOverflow {
    __kind: 'DestinationBufferOverflow'
}

export interface XcmErrorV0_EscalationOfPrivilege {
    __kind: 'EscalationOfPrivilege'
}

export interface XcmErrorV0_ExceedsMaxMessageSize {
    __kind: 'ExceedsMaxMessageSize'
}

export interface XcmErrorV0_FailedToDecode {
    __kind: 'FailedToDecode'
}

export interface XcmErrorV0_FailedToTransactAsset {
    __kind: 'FailedToTransactAsset'
}

export interface XcmErrorV0_LocationCannotHold {
    __kind: 'LocationCannotHold'
}

export interface XcmErrorV0_MultiLocationFull {
    __kind: 'MultiLocationFull'
}

export interface XcmErrorV0_NotHoldingFees {
    __kind: 'NotHoldingFees'
}

export interface XcmErrorV0_NotWithdrawable {
    __kind: 'NotWithdrawable'
}

export interface XcmErrorV0_Overflow {
    __kind: 'Overflow'
}

export interface XcmErrorV0_RecursionLimitReached {
    __kind: 'RecursionLimitReached'
}

export interface XcmErrorV0_SendFailed {
    __kind: 'SendFailed'
}

export interface XcmErrorV0_TooExpensive {
    __kind: 'TooExpensive'
}

export interface XcmErrorV0_TooMuchWeightRequired {
    __kind: 'TooMuchWeightRequired'
}

export interface XcmErrorV0_Undefined {
    __kind: 'Undefined'
}

export interface XcmErrorV0_UnhandledEffect {
    __kind: 'UnhandledEffect'
}

export interface XcmErrorV0_UnhandledXcmMessage {
    __kind: 'UnhandledXcmMessage'
}

export interface XcmErrorV0_UnhandledXcmVersion {
    __kind: 'UnhandledXcmVersion'
}

export interface XcmErrorV0_Unimplemented {
    __kind: 'Unimplemented'
}

export interface XcmErrorV0_UntrustedReserveLocation {
    __kind: 'UntrustedReserveLocation'
}

export interface XcmErrorV0_UntrustedTeleportLocation {
    __kind: 'UntrustedTeleportLocation'
}

export interface XcmErrorV0_WeightLimitReached {
    __kind: 'WeightLimitReached'
    value: Weight
}

export interface XcmErrorV0_WeightNotComputable {
    __kind: 'WeightNotComputable'
}

export interface XcmErrorV0_Wildcard {
    __kind: 'Wildcard'
}

export type Weight = bigint

export const Weight = sts.bigint()

export type Outcome = Outcome_Complete | Outcome_Error | Outcome_Incomplete

export interface Outcome_Complete {
    __kind: 'Complete'
    value: Weight
}

export interface Outcome_Error {
    __kind: 'Error'
    value: XcmErrorV0
}

export interface Outcome_Incomplete {
    __kind: 'Incomplete'
    value: [Weight, XcmErrorV0]
}

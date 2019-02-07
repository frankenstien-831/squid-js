import { Condition } from "./Condition"
import { Contract } from "./Contract"
import { MetaData } from "./MetaData"

export interface ServiceCommon {
    type: string
    serviceEndpoint?: string
    serviceDefinitionId?: string
}

export interface ServiceAuthorization extends ServiceCommon {
    type: "Authorization"
    service: "SecretStore" | "None" | "RSAES-OAEP"
}

export interface ServiceMetadata extends ServiceCommon {
    type: "Metadata"
    metadata: MetaData
}

export interface ServiceBase extends ServiceCommon {
    templateId?: string
    serviceEndpoint: string
    purchaseEndpoint?: string
    description?: string
    serviceAgreementContract?: Contract
    conditions?: Condition[]
}

export type Service = ServiceBase | ServiceAuthorization | ServiceMetadata

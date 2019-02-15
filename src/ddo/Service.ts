import { Condition } from "./Condition"
import { Contract } from "./Contract"
import { MetaData } from "./MetaData"

export type ServiceType = "Authorization" | "Metadata" | "Access" | "Compute" | "FitchainCompute"

export interface ServiceCommon {
    type: ServiceType
    serviceDefinitionId?: string
    serviceEndpoint?: string
}

export interface ServiceAuthorization extends ServiceCommon {
    type: "Authorization"
    service: "SecretStore" | "None" | "RSAES-OAEP"
}

export interface ServiceMetadata extends ServiceCommon {
    type: "Metadata"
    metadata: MetaData
}

export interface ServiceAccess extends ServiceCommon {
    type: "Access"
    templateId?: string
    purchaseEndpoint?: string
    description?: string
    serviceAgreementContract?: Contract
    conditions?: Condition[]
}

export interface ServiceCompute extends ServiceCommon {
    templateId?: string
}

export type Service<T extends ServiceType | "default" = "default"> =
    T extends "Authorization" ? ServiceAuthorization :
    T extends "Metadata" ? ServiceMetadata :
    T extends "Access" ? ServiceAccess :
    T extends "Compute" ? ServiceCompute :
    T extends "default" ? ServiceCommon :
    ServiceCommon

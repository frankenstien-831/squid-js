import { Condition } from "./Condition"
import { Contract } from "./Contract"
import { MetaData } from "./MetaData"

export interface Service {
    type: string
    serviceDefinitionId?: string
    templateId?: string
    serviceEndpoint: string
    purchaseEndpoint?: string
    description?: string
    metadata?: MetaData
    serviceAgreementContract?: Contract
    conditions?: Condition[]
}

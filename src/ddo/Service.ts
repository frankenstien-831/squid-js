import { MetaData } from './MetaData'
import { ServiceAgreementTemplate } from './ServiceAgreementTemplate'
import { Provider } from './ComputingProvider'

export type ServiceType =
    | 'authorization'
    | 'metadata'
    | 'access'
    | 'compute'
    | 'computing'
    | 'fitchainCompute'

export interface ServiceCommon {
    type: ServiceType
    serviceDefinitionId?: string
    serviceEndpoint?: string
}

export interface ServiceAuthorization extends ServiceCommon {
    type: 'authorization'
    service: 'SecretStore' | 'None' | 'RSAES-OAEP'
}

export interface ServiceMetadata extends ServiceCommon {
    type: 'metadata'
    metadata: MetaData
}

export interface ServiceAccess extends ServiceCommon {
    type: 'access'
    name?: string
    description?: string
    creator?: string
    templateId?: string
    purchaseEndpoint?: string
    serviceAgreementTemplate?: ServiceAgreementTemplate
}

export interface ServiceComputing extends ServiceCommon {
    type: 'computing'
    templateId?: string
    provider?: Provider
    serviceAgreementTemplate?: ServiceAgreementTemplate
}

export interface ServiceCompute extends ServiceCommon {
    templateId?: string
}

export type Service<
    T extends ServiceType | 'default' = 'default'
> = T extends 'authorization'
    ? ServiceAuthorization
    : T extends 'metadata'
    ? ServiceMetadata
    : T extends 'computing'
    ? ServiceComputing
    : T extends 'access'
    ? ServiceAccess
    : T extends 'compute'
    ? ServiceCompute
    : T extends 'default'
    ? ServiceCommon
    : ServiceCommon

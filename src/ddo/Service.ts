import { MetaData } from './MetaData'
import { ServiceAgreementTemplate } from './ServiceAgreementTemplate'

export type ServiceType = 'authorization' | 'metadata' | 'access' | 'compute'

export interface ServiceCommon {
    type: ServiceType
    index: number
    serviceEndpoint?: string
    attributes: any & {
        main: { [key: string]: any }
    }
}

export interface ServiceAuthorization extends ServiceCommon {
    type: 'authorization'
    service: 'SecretStore' | 'None' | 'RSAES-OAEP'
}

export interface ServiceMetadata extends ServiceCommon {
    type: 'metadata'
    attributes: MetaData
}

export interface ServiceAccess extends ServiceCommon {
    type: 'access'
    templateId?: string
    attributes: {
        main: {
            creator: string
            name: string
            datePublished: string
            price: string
            timeout: number
        }
        serviceAgreementTemplate?: ServiceAgreementTemplate
        additionalInformation: {
            description: string
        }
    }
}

export interface ServiceCompute extends ServiceCommon {
    type: 'compute'
    templateId?: string
    attributes: {
        main: {
            creator: string
            datePublished: string
            price: string
            timeout: number
            provider?: ServiceComputeProvider
            serviceAgreementTemplate?: ServiceAgreementTemplate
        }
    }
}

export interface ServiceComputeProvider {
    type: string
    description: string
    environment: {
        cluster: {
            type: string
            url: string
        }
        supportedContainers: {
            image: string
            tag: string
            checksum: string
        }[]
        supportedServers: {
            serverId: string
            serverType: string
            price: string
            cpu: string
            gpu: string
            memory: string
            disk: string
            maxExecutionTime: number
        }[]
    }
}

export type Service<
    T extends ServiceType | 'default' = 'default'
> = T extends 'authorization'
    ? ServiceAuthorization
    : T extends 'metadata'
    ? ServiceMetadata
    : T extends 'access'
    ? ServiceAccess
    : T extends 'compute'
    ? ServiceCompute
    : T extends 'default'
    ? ServiceCommon
    : ServiceCommon

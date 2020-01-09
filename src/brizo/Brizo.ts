import { File, MetaData } from '../ddo/MetaData'
import Account from '../ocean/Account'
import { noZeroX } from '../utils'
import { Instantiable, InstantiableConfig } from '../Instantiable.abstract'

const apiPath = '/api/v1/brizo/services'

/**
 * Provides a interface with Brizo.
 * Brizo is the technical component executed by the Publishers allowing to them to provide extended data services.
 */
export class Brizo extends Instantiable {
    private get url() {
        return this.config.brizoUri
    }

    constructor(config: InstantiableConfig) {
        super()
        this.setInstanceConfig(config)
    }

    public async getVersionInfo() {
        return (await this.ocean.utils.fetch.get(this.url)).json()
    }

    public getPurchaseEndpoint() {
        return `${this.url}${apiPath}/access/initialize`
    }

    public getConsumeEndpoint() {
        return `${this.url}${apiPath}/consume`
    }

    public getEncryptEndpoint() {
        return `${this.url}${apiPath}/publish`
    }

    public getComputeEndpoint() {
        return `${this.url}${apiPath}/exec`
    }

    public async initializeServiceAgreement(
        did: string,
        serviceAgreementId: string,
        serviceIndex: number,
        signature: string,
        consumerAddress: string
    ): Promise<any> {
        const args = {
            did,
            serviceAgreementId,
            serviceIndex,
            signature,
            consumerAddress
        }

        try {
            return await this.ocean.utils.fetch.post(
                this.getPurchaseEndpoint(),
                decodeURI(JSON.stringify(args))
            )
        } catch (e) {
            this.logger.error(e)
            throw new Error('HTTP request failed')
        }
    }

    public async consumeService(
        agreementId: string,
        serviceEndpoint: string,
        account: Account,
        files: File[],
        destination: string,
        index: number = -1
    ): Promise<string> {
        const signature = await this.createSignature(account, agreementId)
        const filesPromises = files
            .filter((_, i) => index === -1 || i === index)
            .map(async ({ index: i }) => {
                let consumeUrl = serviceEndpoint
                consumeUrl += `?index=${i}`
                consumeUrl += `&serviceAgreementId=${noZeroX(agreementId)}`
                consumeUrl += `&consumerAddress=${account.getId()}`
                consumeUrl += `&signature=${signature}`

                try {
                    await this.ocean.utils.fetch.downloadFile(consumeUrl, destination, i)
                } catch (e) {
                    this.logger.error('Error consuming assets')
                    this.logger.error(e)
                    throw e
                }
            })
        await Promise.all(filesPromises)
        return destination
    }

    public async executeService(
        agreementId: string,
        serviceEndpoint: string,
        account: Account,
        algorithmDid: string,
        algorithm: string,
        algorithmMeta?: MetaData
    ): Promise<string> {
        const signature = await this.createSignature(account, agreementId)

        let executeUrl = serviceEndpoint
        executeUrl += `&signature=${signature}`
        executeUrl += `&serviceAgreementId=${noZeroX(agreementId)}`
        executeUrl += `&consumerAddress=${account.getId()}`
        executeUrl += `&algorithmDID=${algorithmDid}`
        executeUrl += `&algorithm=${algorithm}`
        executeUrl += `&algorithmMeta=${algorithmMeta}`

        const result: { workflowId: string } = await this.ocean.utils.fetch
            .post(executeUrl, '')
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }

                this.logger.error(
                    'Executing compute job failed:',
                    response.status,
                    response.statusText
                )

                return null
            })
            .catch(error => {
                this.logger.error('Error executing compute job')
                this.logger.error(error)
                throw error
            })

        return result.workflowId
    }

    public async createSignature(account: Account, agreementId: string): Promise<string> {
        const signature =
            (await account.getToken()) ||
            (await this.ocean.utils.signature.signText(
                noZeroX(agreementId),
                account.getId()
            ))

        return signature
    }

    public async encrypt(
        did: string,
        signature: string,
        document: any,
        publisher: string
    ): Promise<string> {
        const args = {
            documentId: did,
            signature,
            document: JSON.stringify(document),
            publisherAddress: publisher
        }

        try {
            const response = await this.ocean.utils.fetch.post(
                this.getEncryptEndpoint(),
                decodeURI(JSON.stringify(args))
            )
            if (!response.ok) {
                throw new Error('HTTP request failed')
            }
            return await response.text()
        } catch (e) {
            this.logger.error(e)
            throw new Error('HTTP request failed')
        }
    }
}

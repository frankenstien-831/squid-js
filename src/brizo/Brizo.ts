import save = require("save-file")
import { File } from "../ddo/MetaData"
import Account from "../ocean/Account"
import WebServiceConnectorProvider from "../utils/WebServiceConnectorProvider"
import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

const apiPath = "/api/v1/brizo/services"

/**
 * Provides a interface with Brizo.
 * Brizo is the technical component executed by the Publishers allowing to them to provide extended data services.
 */
export class Brizo  extends Instantiable {
    private get url() {
        return this.config.brizoUri
    }

    constructor(config: InstantiableConfig) {
        super()
        this.setInstanceConfig(config)
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

    public getComputeEndpoint(pubKey: string, serviceId: string, algo: string, container: string) {
        // tslint:disable-next-line
        return `${this.url}${apiPath}/compute`
    }

    public async initializeServiceAgreement(
        did: string,
        serviceAgreementId: string,
        serviceDefinitionId: string,
        signature: string,
        consumerAddress: string,
    ): Promise<any> {

        const args = {
            did,
            serviceAgreementId,
            serviceDefinitionId,
            signature,
            consumerAddress,
        }

        try {
            return await WebServiceConnectorProvider
                .getConnector()
                .post(
                    this.getPurchaseEndpoint(),
                    decodeURI(JSON.stringify(args)),
                )
        } catch (e) {
            this.logger.error(e)
            throw new Error("HTTP request failed")
        }
    }

    public async consumeService(
        agreementId: string,
        serviceEndpoint: string,
        account: Account,
        files: File[],
        destination: string,
        index: number = -1,
    ): Promise<string> {
        const agreementIdSignature = await this.ocean.utils.signature.signText(agreementId, account.getId())
        const filesPromises = files
            .filter(({}, i) => index === -1 || i === index)
            .map(async ({index: i}) => {
                let consumeUrl = serviceEndpoint
                consumeUrl += `?index=${i}`
                consumeUrl += `&serviceAgreementId=${agreementId}`
                consumeUrl += `&consumerAddress=${account.getId()}`
                consumeUrl += `&signature=${agreementIdSignature}`

                try {
                    await this.downloadFile(
                        consumeUrl,
                        `file-${i}`,
                        destination,
                    )
                } catch (e) {
                    this.logger.error("Error consuming assets")
                    this.logger.error(e)
                    throw new Error("Error consuming assets")
                }
            })
        await Promise.all(filesPromises)
        return destination
    }

    public async encrypt(
        did: string,
        signedDid: string,
        document: any,
        publisher: string,
    ): Promise<string> {

        const args = {
            documentId: did,
            signedDocumentId: signedDid,
            document: JSON.stringify(document),
            publisherAddress: publisher,
        }

        try {
            const response = await WebServiceConnectorProvider
                .getConnector()
                .post(
                    this.getEncryptEndpoint(),
                    decodeURI(JSON.stringify(args)),
                )
            if (!response.ok) {
                throw new Error("HTTP request failed")
            }
            return await response.text()
        } catch (e) {
            this.logger.error(e)
            throw new Error("HTTP request failed")
        }
    }

    private async downloadFile(url: string, filename: string, destination?: string): Promise<string> {
        const path = `${destination}${filename}`
        const response = await WebServiceConnectorProvider
            .getConnector()
            .get(url)
        await save(await response.arrayBuffer(), path)
        return path
    }
}

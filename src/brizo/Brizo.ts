import Config from "../models/Config"
import WebServiceConnectorProvider from "../utils/WebServiceConnectorProvider"

const apiPath = "/api/v1/brizo/services"

/**
 * Provides a interface with Brizo.
 * Brizo is the technical component executed by the Publishers allowing to them to provide extended data services.
 */
export default class Brizo {
    private url: string

    constructor(config: Config) {
        this.url = config.brizoUri
    }

    public getPurchaseEndpoint() {
        return `${this.url}${apiPath}/access/initialize`
    }

    public getConsumeEndpoint() {
        return `${this.url}${apiPath}/consume`
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
        consumerAddress: string): Promise<any> {

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
            throw new Error("HTTP request failed")
        }
    }
}

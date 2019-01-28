import {Receipt} from "web3-utils"
import MethodReflection from "../../models/MethodReflection"
import DID from "../../ocean/DID"
import ContractBase from "./ContractBase"

export default class ServiceExecutionAgreement extends ContractBase {

    public static async getInstance(): Promise<ServiceExecutionAgreement> {
        const serviceAgreement: ServiceExecutionAgreement = new ServiceExecutionAgreement("ServiceExecutionAgreement")
        await serviceAgreement.init()
        return serviceAgreement
    }

    public async setupAgreementTemplate(templateId: string,
                                        methodReflections: MethodReflection[],
                                        dependencyMatrix: number[],
                                        name: any,
                                        fulfillmentIndices: number[],
                                        fulfillmentOperator: number,
                                        ownerAddress: string): Promise<Receipt> {

        return this.send("setupAgreementTemplate", ownerAddress, [
            templateId, methodReflections.map((r) => r.address),
            methodReflections.map((r) => r.signature), dependencyMatrix, name, fulfillmentIndices,
            fulfillmentOperator,
        ])
    }

    // todo get service agreement consumer

    public async getTemplateStatus(templateId: string) {

        return this.call("getTemplateStatus", [templateId])
    }

    public async getTemplateOwner(templateId: string) {

        return this.call("getTemplateOwner", [templateId])
    }

    public async getAgreementStatus(serviceDefinitionId: string) {

        return this.call("getAgreementStatus", [serviceDefinitionId])
    }

    public async executeAgreement(
        serviceAgreementTemplateId: string,
        serviceAgreementSignatureHash: string,
        consumerAddress: string,
        valueHashes: string[],
        timeoutValues: number[],
        serviceAgreementId: string,
        did: DID,
        publisherAddress: string,
    ): Promise<Receipt> {
console.log({serviceAgreementTemplateId, serviceAgreementSignatureHash, consumerAddress, valueHashes, timeoutValues, serviceAgreementId, did, publisherAddress})
        return this.send("executeAgreement", publisherAddress, [
            serviceAgreementTemplateId, serviceAgreementSignatureHash, consumerAddress, valueHashes,
            timeoutValues, "0x" + serviceAgreementId, "0x" + did.getId(),
        ])
    }
}

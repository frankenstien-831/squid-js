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

    public async setupTemplate(
        templateId: string,
        methodReflections: MethodReflection[],
        dependencyMatrix: number[],
        fulfillmentIndices: number[],
        fulfillmentOperator: number,
        ownerAddress: string,
    ): Promise<Receipt> {

        return this.send("setupTemplate", ownerAddress, [
            templateId, methodReflections.map((r) => r.address),
            methodReflections.map((r) => r.signature), dependencyMatrix, fulfillmentIndices,
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

    public async initializeAgreement(
        serviceAgreementTemplateId: string,
        serviceAgreementSignatureHash: string,
        consumerAddress: string,
        valueHashes: string[],
        timeoutValues: number[],
        serviceAgreementId: string,
        did: DID,
        publisherAddress: string,
    ): Promise<Receipt> {

        return this.send("initializeAgreement", publisherAddress, [
            serviceAgreementTemplateId, serviceAgreementSignatureHash, consumerAddress, valueHashes,
            timeoutValues, "0x" + serviceAgreementId, "0x" + did.getId(),
        ])
    }
}

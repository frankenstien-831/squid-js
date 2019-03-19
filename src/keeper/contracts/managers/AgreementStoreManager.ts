import LoggerInstance from "../../../utils/Logger"
import ContractBase from "../ContractBase"
import { zeroX } from "../../../utils"

export interface AgreementData {
    did: string
    didOwner: string
    templateId: string
    conditionIds: string[]
    lastUpdatedBy: string
    blockNumberUpdated: number
}

export class AgreementStoreManager extends ContractBase {

    public static async getInstance(): Promise<AgreementStoreManager> {
        const templateStoreManeger: AgreementStoreManager = new AgreementStoreManager("AgreementStoreManager")
        await templateStoreManeger.init()
        return templateStoreManeger
    }

    public getOwner(): Promise<string> {
        return this.call("owner", [])
    }

    public async getAgreement(agreementId: string) {
        const {did, didOwner, templateId, conditionIds, lastUpdatedBy, blockNumberUpdated} =
            await this.call("getAgreement", [zeroX(agreementId)])
        return {did, didOwner, templateId, conditionIds, lastUpdatedBy, blockNumberUpdated: +blockNumberUpdated} as AgreementData
    }
}

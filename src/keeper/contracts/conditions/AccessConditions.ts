import {Receipt} from "web3-utils"
import ContractBase from "../ContractBase"

export default class AccessConditions extends ContractBase {

    public static async getInstance(): Promise<AccessConditions> {
        const accessConditions: AccessConditions = new AccessConditions("AccessConditions")
        await accessConditions.init()
        return accessConditions
    }

    // todo add check permissions proxy

    public async grantAccess(serviceAgreementId: any, documentKeyId: any, publisherAddress: string)
        : Promise<Receipt> {
        return this.send("grantAccess", publisherAddress, [
            serviceAgreementId, "0x" + documentKeyId,
        ])
    }
}

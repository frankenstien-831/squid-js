import { Brizo } from "../../src/brizo/Brizo"

export default class BrizoMock extends Brizo {

    public async initializeServiceAgreement(did: string, serviceAgreementId: string, serviceDefinitionId: string,
                                            signature: string, consumerPublicKey: string): Promise<any> {

        return true
    }
}

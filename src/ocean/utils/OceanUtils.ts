import { Instantiable, InstantiableConfig } from "../../Instantiable.abstract"

import { ServiceAgreement } from "./ServiceAgreement"
import { SignatureUtils } from "./SignatureUtils"

/**
 * Utils internal submodule of Ocean Protocol.
 */
export class OceanUtils extends Instantiable {

    /**
     * Returns the instance of OceanUtils.
     * @return {Promise<OceanUtils>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<OceanUtils> {
        const instance = new OceanUtils()
        instance.setInstanceConfig(config)

        instance.agreements = new ServiceAgreement(config)
        instance.signature = new SignatureUtils(config)

        return instance
    }

    /**
     * Agreement utils.
     * @type {ServiceAgreement}
     */
    public agreements: ServiceAgreement

    /**
     * Signature utils.
     * @type {SignatureUtils}
     */
    public signature: SignatureUtils
}

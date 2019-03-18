import { Condition } from "./Condition.abstract"
import { zeroX, didZeroX } from "../../../utils"

export class AccessSecretStoreCondition extends Condition {

    public static async getInstance(): Promise<AccessSecretStoreCondition> {
        return Condition.getInstance("AccessSecretStoreCondition", AccessSecretStoreCondition)
    }

    public hashValues(did: string, grantee: string) {
        return super.hashValues(didZeroX(did), zeroX(grantee))
    }

    public fulfill(agreementId: string, did: string, grantee: string, from?: string) {
        return super.fulfill(agreementId, [didZeroX(did), grantee].map(zeroX), from)
    }

    public checkPermissions(grantee: string, did: string, from?: string) {
        return this.call<boolean>("checkPermissions", [grantee, didZeroX(did)].map(zeroX), from)
    }
}

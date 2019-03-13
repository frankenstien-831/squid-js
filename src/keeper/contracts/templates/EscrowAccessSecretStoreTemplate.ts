import { AgreementTemplate } from "./AgreementTemplate.abstract"
import { LockRewardCondition, EscrowReward, AccessSecretStoreCondition } from '../conditions'
import DIDRegistry from '../DIDRegistry'
import { DDO } from '../../../ddo/DDO'
import { generateId, zeroX } from '../../../utils'

import { escrowAccessSecretStoreTemplateServiceAgreementTemplate } from "./EscrowAccessSecretStoreTemplate.serviceAgreementTemplate"

export class EscrowAccessSecretStoreTemplate extends AgreementTemplate {

    public static async getInstance(): Promise<EscrowAccessSecretStoreTemplate> {
        return AgreementTemplate.getInstance("EscrowAccessSecretStoreTemplate", EscrowAccessSecretStoreTemplate)
    }

    public async getServiceAgreementTemplate() {
        return escrowAccessSecretStoreTemplateServiceAgreementTemplate
    }

    /**
     * Create a agreement using EscrowAccessSecretStoreTemplate.
     * @param {string}   agreementId    Generated agreement ID.
     * @param {string}   did            Asset DID.
     * @param {string[]} conditionIds   List of conditions IDs.
     * @param {number[]} timeLocks      Timelocks.
     * @param {number[]} timeOuts       Timeouts.
     * @param {string}   accessConsumer Consumer address.
     * @param {string}   from           Action sender.
     * @param {any}                     Transaction receipt.
     */
    public createAgreement(
        agreementId: string,
        did: string,
        conditionIds: string[],
        timeLocks: number[],
        timeOuts: number[],
        accessConsumer: string,
        from?: string,
    ) {
        return super.createAgreement(
            agreementId,
            did,
            conditionIds,
            timeLocks,
            timeOuts,
            [accessConsumer],
            from,
        )
    }

    /**
     * Create a agreement using EscrowAccessSecretStoreTemplate using only the most important information.
     * @param  {string}          did    Asset DID.
     * @param  {number}          amount Asset price.
     * @param  {string}          from   Consumer address.
     * @return {Promise<string>}        Agreement ID.
     */
    public async createFullAgreement(did: string, amount: number, from?: string): Promise<string> {
        const agreementId = zeroX(generateId())
        const {accessSecretStoreConditionId, lockRewardConditionId, escrowRewardId} =
            await this.createFullAgreementData(agreementId, did, amount, from)


        await this.createAgreement(
            agreementId,
            did,
            [accessSecretStoreConditionId, lockRewardConditionId, escrowRewardId],
            [0, 0, 0],
            [0, 0, 0],
            from,
        )

        return agreementId
    }

    public async getAgreementIdsFromDDO(agreementId: string, ddo: DDO, from: string) {
        const {accessSecretStoreConditionId, lockRewardConditionId, escrowRewardId} =
            await this.createFullAgreementData(agreementId, ddo.shortId(), ddo.findServiceByType("Metadata").metadata.base.price, from)
        return [accessSecretStoreConditionId, lockRewardConditionId, escrowRewardId]
    }

    private async createFullAgreementData(agreementId: string, did: string, amount: number, from?: string) {
        from = await this.getFromAddress(from)

        const didRegistry = await DIDRegistry.getInstance()

        const accessSecretStoreCondition = await AccessSecretStoreCondition.getInstance()
        const lockRewardCondition = await LockRewardCondition.getInstance()
        const escrowReward = await EscrowReward.getInstance()

        const publisher = await didRegistry.getDIDOwner(did)

        const lockRewardConditionId = await lockRewardCondition.generateIdHash(agreementId, await escrowReward.getAddress(), amount)
        const accessSecretStoreConditionId = await accessSecretStoreCondition.generateIdHash(agreementId, did, from)
        const escrowRewardId = await escrowReward.generateIdHash(
            agreementId,
            amount,
            from,
            publisher,
            lockRewardConditionId,
            accessSecretStoreConditionId,
        )

        return {
            lockRewardConditionId,
            accessSecretStoreConditionId,
            escrowRewardId,
        }
    }
}

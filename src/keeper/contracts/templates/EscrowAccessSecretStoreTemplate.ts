import { AgreementTemplate } from './AgreementTemplate.abstract'
import { DDO } from '../../../ddo/DDO'
import { generateId, zeroX } from '../../../utils'
import { InstantiableConfig } from '../../../Instantiable.abstract'

import { escrowAccessSecretStoreTemplateServiceAgreementTemplate } from './EscrowAccessSecretStoreTemplate.serviceAgreementTemplate'

export class EscrowAccessSecretStoreTemplate extends AgreementTemplate {
    public static async getInstance(
        config: InstantiableConfig
    ): Promise<EscrowAccessSecretStoreTemplate> {
        return AgreementTemplate.getInstance(
            config,
            'EscrowAccessSecretStoreTemplate',
            EscrowAccessSecretStoreTemplate
        )
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
        from?: string
    ) {
        return super.createAgreement(
            agreementId,
            did,
            conditionIds,
            timeLocks,
            timeOuts,
            [accessConsumer],
            from
        )
    }

    public async createAgreementFromDDO(
        agreementId: string,
        ddo: DDO,
        consumer: string,
        from?: string
    ) {
        return !!(await this.createFullAgreement(
            ddo.shortId(),
            ddo.findServiceByType('Metadata').metadata.main.price,
            consumer,
            from,
            agreementId
        ))
    }

    public async getAgreementIdsFromDDO(
        agreementId: string,
        ddo: DDO,
        consumer: string,
        from?: string
    ) {
        const {
            accessSecretStoreConditionId,
            lockRewardConditionId,
            escrowRewardId
        } = await this.createFullAgreementData(
            agreementId,
            ddo.shortId(),
            ddo.findServiceByType('Metadata').metadata.main.price,
            consumer
        )
        return [
            accessSecretStoreConditionId,
            lockRewardConditionId,
            escrowRewardId
        ]
    }

    /**
     * Create a agreement using EscrowAccessSecretStoreTemplate using only the most important information.
     * @param  {string}          did    Asset DID.
     * @param  {number}          amount Asset price.
     * @param  {string}          from   Consumer address.
     * @return {Promise<string>}        Agreement ID.
     */
    public async createFullAgreement(
        did: string,
        amount: number | string,
        consumer: string,
        from?: string,
        agreementId: string = generateId()
    ): Promise<string> {
        const {
            accessSecretStoreConditionId,
            lockRewardConditionId,
            escrowRewardId
        } = await this.createFullAgreementData(
            agreementId,
            did,
            amount,
            consumer
        )

        await this.createAgreement(
            agreementId,
            did,
            [
                accessSecretStoreConditionId,
                lockRewardConditionId,
                escrowRewardId
            ],
            [0, 0, 0],
            [0, 0, 0],
            consumer,
            from
        )

        return zeroX(agreementId)
    }

    private async createFullAgreementData(
        agreementId: string,
        did: string,
        amount: number | string,
        consumer: string
    ) {
        const { didRegistry, conditions } = this.ocean.keeper

        const {
            accessSecretStoreCondition,
            lockRewardCondition,
            escrowReward
        } = conditions

        const publisher = await didRegistry.getDIDOwner(did)

        const lockRewardConditionId = await lockRewardCondition.generateIdHash(
            agreementId,
            await escrowReward.getAddress(),
            amount
        )
        const accessSecretStoreConditionId = await accessSecretStoreCondition.generateIdHash(
            agreementId,
            did,
            consumer
        )
        const escrowRewardId = await escrowReward.generateIdHash(
            agreementId,
            String(amount),
            publisher,
            consumer,
            lockRewardConditionId,
            accessSecretStoreConditionId
        )

        return {
            lockRewardConditionId,
            accessSecretStoreConditionId,
            escrowRewardId
        }
    }

    public async getAgreementData(agreementId: string) {
        return this.call<any>('getAgreementData', [zeroX(agreementId)])
    }
}

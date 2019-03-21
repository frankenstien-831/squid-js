import { generateId } from "../utils/GeneratorHelpers"
import Account from "./Account"
import DID from "./DID"
import ServiceAgreement from "./ServiceAgreements/ServiceAgreement"
import { zeroX, didPrefixed } from "../utils"
import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

import { OceanAgreementsConditions } from "./OceanAgreementsConditions"

export interface AgreementPrepareResult {
    agreementId: string
    signature: string
}

/**
 * Agreements submodule of Ocean Protocol.
 */
export class OceanAgreements extends Instantiable {

    /**
     * Returns the instance of OceanAgreements.
     * @return {Promise<OceanAgreements>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<OceanAgreements> {
        const instance = new OceanAgreements()
        instance.setInstanceConfig(config)
        instance.conditions = await OceanAgreementsConditions.getInstance(config)

        return instance
    }

    /**
     * Agreements Conditions submodule.
     * @type {OceanAgreementsConditions}
     */
    public conditions: OceanAgreementsConditions

    /**
     * Creates a consumer signature for the specified asset service.
     * @param  {string} did Decentralized ID.
     * @param  {string} serviceDefinitionId Service definition ID.
     * @param  {Account} consumer Consumer account.
     * @return {Promise<AgreementPrepareResult>} Agreement ID and signaturee.
     */
    public async prepare(
        did: string,
        serviceDefinitionId: string,
        consumer: Account,
    ): Promise<AgreementPrepareResult> {

        const d: DID = DID.parse(did as string)
        const ddo = await this.ocean.aquarius.retrieveDDO(d)
        const agreementId: string = generateId()

        const templateName = ddo.findServiceByType("Access").serviceAgreementTemplate.contractName
        const agreementConditionsIds = await this.ocean.keeper
            .getTemplateByName(templateName)
            .getAgreementIdsFromDDO(agreementId, ddo, consumer.getId(), consumer.getId())

        const signature = await ServiceAgreement.signServiceAgreement(
            this.web3,
            ddo,
            serviceDefinitionId,
            agreementId,
            agreementConditionsIds,
            consumer,
        )

        return {agreementId, signature}
    }

    /**
     * Submit a service agreement to the publisher to create the agreement on-chain.
     * @param  {string} did Decentralized ID.
     * @param  {string} serviceDefinitionId Service definition ID.
     * @param  {Account} consumer Consumer account.
     * @return {Promise<void>}
     */
    public async send(
        did: string,
        agreementId: string,
        serviceDefinitionId: string,
        signature: string,
        consumer: Account,
    ): Promise<void> {

        const result = await this.ocean.brizo
            .initializeServiceAgreement(
                didPrefixed(did),
                zeroX(agreementId),
                serviceDefinitionId,
                zeroX(signature),
                consumer.getId(),
            )

        if (!result.ok) {
            throw new Error("Error on initialize agreement: " + await result.text())
        }
    }

    /**
     * Create a service agreement on-chain. This should be called by the publisher of the asset.
     * Consumer signature will be verified on-chain, but it is recommended to verify the signature
     * in this method before submitting on-chain.
     * @param  {string} did Decentralized ID.
     * @param  {string} agreementId Service agreement ID.
     * @param  {string} serviceDefinitionId Service definition ID.
     * @param  {string} signature Service agreement signature.
     * @param  {Account} consumer Consumer account.
     * @param  {Account} publisher Publisher account.
     * @return {Promise<boolean>}
     */
    public async create(
        did: string,
        agreementId: string,
        serviceDefinitionId: string,
        signature: string,
        consumer: Account,
        publisher: Account,
    ) {
        const d: DID = DID.parse(did)
        const ddo = await this.ocean.aquarius.retrieveDDO(d)

        const templateName = ddo.findServiceById<"Access">(serviceDefinitionId).serviceAgreementTemplate.contractName
        await this.ocean.keeper
            .getTemplateByName(templateName)
            .createAgreementFromDDO(agreementId, ddo, consumer.getId(), publisher.getId())

        return true
    }
}

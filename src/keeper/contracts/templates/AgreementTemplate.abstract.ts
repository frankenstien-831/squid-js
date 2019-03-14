import ContractBase from "../ContractBase"
import { AgreementStoreManager, ConditionStoreManager } from "../managers"
import { Condition, ConditionState, conditionStateNames } from "../conditions/Condition.abstract"
import Keeper from "../../Keeper"
import { DDO } from "../../../ddo/DDO"
import { ServiceAgreementTemplate } from "../../../ddo/ServiceAgreementTemplate"
import { zeroX, Logger } from "../../../utils"
import EventListener from "../../../keeper/EventListener"
import Event from "../../../keeper/Event"

export abstract class AgreementTemplate extends ContractBase {

    public static async getInstance(conditionName: string, templateClass: any): Promise<AgreementTemplate & any> {
        const condition: AgreementTemplate = new (templateClass as any)(conditionName)
        await condition.init()
        return condition
    }

    protected constructor(contractName: string) {
        super(contractName)
    }

    // tslint:disable-next-line
    public createAgreement(agreementId: string, did: string, conditionIds: string[], timeLocks: number[], timeOuts: number[], ...args: any[])
    public createAgreement(
        agreementId: string,
        did: string,
        conditionIds: string[],
        timeLocks: number[],
        timeOuts: number[],
        extraArgs: any[],
        from?: string,
    ) {
        return this.sendFrom(
            "createAgreement",
            [
                zeroX(agreementId),
                zeroX(did),
                conditionIds.map(zeroX),
                timeLocks,
                timeOuts,
                ...extraArgs,
            ],
            from,
        )
    }

    /**
     * Conditions address list.
     * @return {Promise<string[]>} Conditions address.
     */
    public getConditionTypes(): Promise<string[]> {
        return this.call("getConditionTypes", [])
    }

    /**
     * List of condition contracts.
     * @return {Promise<Condition[]>} Conditions contracts.
     */
    public async getConditions(): Promise<Condition[]> {
        const keeper = await Keeper.getInstance()
        return (await this.getConditionTypes())
            .map((address) => keeper.getConditionByAddress(address))
    }

    /**
     * Get agreement conditions IDs.
     * @param  {string}            agreementId Agreement ID.
     * @param  {DDO}               ddo         DDO.
     * @param  {string}            from        Consumer address.
     * @return {Promise<string[]>}             Condition IDs.
     */
    public abstract getAgreementIdsFromDDO(agreementId: string, ddo: DDO, consumer: string, from?: string): Promise<string[]>

    /**
     * Create a new agreement using the data of a DDO.
     * @param  {string}            agreementId Agreement ID.
     * @param  {DDO}               ddo         DDO.
     * @param  {string}            from        Creator address.
     * @return {Promise<boolean>}              Success.
     */
    public abstract createAgreementFromDDO(agreementId: string, ddo: DDO, consumer: string, from?: string): Promise<boolean>

    public abstract async getServiceAgreementTemplate(): Promise<ServiceAgreementTemplate>

    public async getServiceAgreementTemplateConditions() {
        const serviceAgreementTemplate = await this.getServiceAgreementTemplate()
        return serviceAgreementTemplate.conditions
    }

    public async getServiceAgreementTemplateConditionByRef(ref: string) {
        const name = (await this.getServiceAgreementTemplateConditions())
            .find(({name: conditionRef}) => conditionRef === ref)
            .contractName
        return (await this.getConditions())
            .find((condition) => condition.contractName === name)
    }

    public async getServiceAgreementTemplateDependencies() {
        const serviceAgreementTemplate = await this.getServiceAgreementTemplate()
        return serviceAgreementTemplate.conditionDependency
    }

    /**
     * Returns the status of the conditions.
     * @param  {string}  agreementId Agreement ID.
     * @return {Promise}             Conditions status.
     */
    public async getAgreementStatus(
        agreementId: string,
    ): Promise<{
        [condition: string]: {
            condition: string,
            contractName: string,
            state: ConditionState,
            blocked: boolean,
            blockedBy: string[],
        },
    } | false> {
        const agreementStore = await AgreementStoreManager.getInstance()
        const conditionStore = await ConditionStoreManager.getInstance()

        const dependencies = await this.getServiceAgreementTemplateDependencies()
        const {conditionIds} = await agreementStore.getAgreement(agreementId)

        if (!conditionIds.length) {
            Logger.error(`Agreement not creeated yet: "${agreementId}"`)
            return false
        }

        const conditionIdByConddition = (await this.getConditions())
            .reduce((acc, {contractName}, i) => ({...acc, [contractName]: conditionIds[i]}), {})

        const statesPromises = Object.keys(dependencies)
            .map(async (ref, i) => {
                const {contractName} = await this.getServiceAgreementTemplateConditionByRef(ref)
                return {
                    ref,
                    contractName,
                    state: (await conditionStore.getCondition(conditionIdByConddition[contractName])).state,
                }
            })
        const states = await Promise.all(statesPromises)

        return states
            .reduce((acc, {contractName, ref, state}) => {
                const blockers = dependencies[ref]
                    .map((dependency) => states.find((_) => _.ref === dependency))
                    .filter((condition) => condition.state !== ConditionState.Fulfilled)
                return {
                    ...acc,
                    [ref]: {
                        condition: ref,
                        contractName,
                        state,
                        blocked: !!blockers.length,
                        blockedBy: blockers.map((_) => _.ref),
                    },
                }
            }, {})
    }

    /**
     * Prints the agreement status.
     * @param {string} agreementId Agreement ID.
     */
    public async printAgreementStatus(agreementId: string) {
        const status = await this.getAgreementStatus(agreementId)

        Logger.bypass("-".repeat(80))
        Logger.bypass("Template:", this.contractName)
        Logger.bypass("Agreement ID:", agreementId)
        Logger.bypass("-".repeat(40))
        if (!status) {
            Logger.bypass("Agreement not created yet!")
        }
        Object.values(status || [])
            .forEach(({condition, contractName, state, blocked, blockedBy}, i) => {
                if (i) {
                    Logger.bypass("-".repeat(20))
                }
                Logger.bypass(`${condition} (${contractName})`)
                Logger.bypass("  Status:", state, `(${conditionStateNames[state]})`)
                if (blocked) {
                    Logger.bypass("  Blocked by:", blockedBy)
                }
            })
        Logger.bypass("-".repeat(80))
    }

    /**
     * Generates and returns the agreement creation event.
     * @param  {string} agreementId Agreement ID.
     * @return {Event}              Agreement created event.
     */
    public getAgreementCreatedEvent(agreementId: string): Event {
        return EventListener
            .subscribe(
                this.contractName,
                "AgreementCreated",
                {agreementId: zeroX(agreementId)},
            )
    }
}

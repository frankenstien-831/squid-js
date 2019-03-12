import ContractBase from "../ContractBase"
import { AgreementStoreManager, ConditionStoreManager } from "../managers"
import { Condition, ConditionState, conditionStateNames } from "../conditions/Condition.abstract"
import Keeper from "../../Keeper"
import { DDO } from '../../../ddo/DDO'
import { ServiceAgreementTemplate, ServiceAgreementTemplateCondition } from '../../../ddo/ServiceAgreementTemplate'
import { zeroX, Logger } from "../../../utils"

export abstract class AgreementTemplate extends ContractBase {

    protected constructor(contractName: string) {
        super(contractName)
    }

    public static async getInstance(conditionName: string, templateClass: any): Promise<AgreementTemplate & any> {
        const condition: AgreementTemplate = new (templateClass as any)(conditionName)
        await condition.init()
        return condition
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

    public getConditionTypes(): Promise<string[]> {
        return this.call("getConditionTypes", [])
    }

    public async getConditions(): Promise<Condition[]> {
        const keeper = await Keeper.getInstance()
        return (await this.getConditionTypes())
            .map(address => keeper.getConditionByAddress(address))
    }

    abstract async getServiceAgreementTemplateValuesMap(ddo: DDO, agreementId: string, consumer: string): Promise<{[value: string]: string}>

    abstract getServiceAgreementTemplate(): Promise<ServiceAgreementTemplate>

    public async getServiceAgreementTemplateConditions() {
        const serviceAgreementTemplate = await this.getServiceAgreementTemplate()
        return serviceAgreementTemplate.conditions
    }

    public async getServiceAgreementTemplateConditionByRef(ref: string) {
        const name = (await this.getServiceAgreementTemplateConditions())
            .find(({name: conditionRef}) => conditionRef === ref)
            .contractName
        return (await this.getConditions())
            .find(condition => condition.contractName === name)
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
        agreementId: string
    ): Promise<{
        [condition: string]: {
            condition: string,
            contractName: string,
            state: ConditionState,
            blocked: boolean,
            blockedBy: string[]
        }
    }> {
        const agreementStore = await AgreementStoreManager.getInstance()
        const conditionStore = await ConditionStoreManager.getInstance()

        const dependencies = await this.getServiceAgreementTemplateDependencies()
        const {conditionIds} = await agreementStore.getAgreement(agreementId)

        const statesPromises = Object.keys(dependencies)
            .map(async (ref, i) => {
                const condition = await this.getServiceAgreementTemplateConditionByRef(ref)
                return {
                    ref,
                    contractName: condition.contractName,
                    state: (await conditionStore.getCondition(conditionIds[i])).state
                }
            })
        const states = await Promise.all(statesPromises)

        return states
            .reduce((acc, {contractName, ref, state}) => {
                const blockers = dependencies[ref]
                    .map(dependency => states.find(({ref}) => ref === dependency))
                    .filter(condition => condition.state !== ConditionState.Fulfilled)
                return {
                    ...acc,
                    [ref]: {
                        condition: ref,
                        contractName,
                        state,
                        blocked: !!blockers.length,
                        blockedBy: blockers.map(_ => _.ref),
                    }
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
        Object.values(status)
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
}

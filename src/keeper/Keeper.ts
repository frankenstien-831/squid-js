import DIDRegistry from "./contracts/DIDRegistry"
import Dispenser from "./contracts/Dispenser"
import OceanToken from "./contracts/Token"
import { Condition, LockRewardCondition, EscrowReward, AccessSecretStoreCondition } from "./contracts/conditions"
import { AgreementTemplate, EscrowAccessSecretStoreTemplate } from "./contracts/templates"
import { TemplateStoreManager, AgreementStoreManager, ConditionStoreManager } from "./contracts/managers"

import { objectPromiseAll } from "../utils"
import { EventHandler } from "./EventHandler"

import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

/**
 * Interface with Ocean Keeper contracts.
 * Ocean Keeper implementation where we put the following modules together:
 * - TCRs: users create challenges and resolve them through voting to maintain registries.
 * - Ocean Tokens: the intrinsic tokens circulated inside Ocean network, which is used in the voting of TCRs.
 * - Marketplace: the core marketplace where people can transact with each other with Ocean tokens.
 */
export class Keeper extends Instantiable {

    /**
     * Returns Keeper instance.
     * @return {Promise<Keeper>}
     */
    public static async getInstance(config: InstantiableConfig): Promise<Keeper> {
        const keeper = new Keeper()
        keeper.setInstanceConfig(config)

        // Adding keeper inside Ocean to prevent `Keeper not defined yet` error
        config.ocean.keeper = keeper

        let instances = {} as any
        try {
            instances = await objectPromiseAll({
                // Main contracts
                dispenser: Dispenser.getInstance(config),
                token: OceanToken.getInstance(config),
                didRegistry: DIDRegistry.getInstance(config),
                // Managers
                templateStoreManager: TemplateStoreManager.getInstance(config),
                agreementStoreManager: AgreementStoreManager.getInstance(config),
                conditionStoreManager: ConditionStoreManager.getInstance(config),
                // Conditions
                lockRewardCondition: LockRewardCondition.getInstance(config),
                escrowReward: EscrowReward.getInstance(config),
                accessSecretStoreCondition: AccessSecretStoreCondition.getInstance(config),
                // Conditions
                escrowAccessSecretStoreTemplate: EscrowAccessSecretStoreTemplate.getInstance(config),
            })

            keeper.connected = true
        } catch {
            keeper.connected = false
            return
        }

        // Main contracts
        keeper.dispenser = instances.dispenser
        keeper.token = instances.token
        keeper.didRegistry = instances.didRegistry
        // Managers
        keeper.templateStoreManager = instances.templateStoreManager
        keeper.agreementStoreManager = instances.agreementStoreManager
        keeper.conditionStoreManager = instances.conditionStoreManager
        // Conditions
        keeper.conditions = {
            lockRewardCondition: instances.lockRewardCondition,
            escrowReward: instances.escrowReward,
            accessSecretStoreCondition: instances.accessSecretStoreCondition,
        }
        // Conditions
        keeper.templates = {
            escrowAccessSecretStoreTemplate: instances.escrowAccessSecretStoreTemplate,
        }

        // Utils
        keeper.utils = {
            eventHandler: new EventHandler(config),
        }

        return keeper
    }

    /**
     * Is connected to the correct network or not.
     * @type {boolean}
     */
    public connected: boolean = false

    /**
     * Ocean Token smart contract instance.
     * @type {OceanToken}
     */
    public token: OceanToken

    /**
     * Ocean Market smart contract instance.
     * @type {Dispenser}
     */
    public dispenser: Dispenser

    /**
     * DID registry smart contract instance.
     * @type {DIDRegistry}
     */
    public didRegistry: DIDRegistry

    /**
     * Template store manager smart contract instance.
     * @type {TemplateStoreManager}
     */
    public templateStoreManager: TemplateStoreManager

    /**
     * Template store manager smart contract instance.
     * @type {AgreementStoreManager}
     */
    public agreementStoreManager: AgreementStoreManager

    /**
     * Template store manager smart contract instance.
     * @type {ConditionStoreManager}
     */
    public conditionStoreManager: ConditionStoreManager

    /**
     * Conditions instances.
     */
    public conditions: {
        lockRewardCondition: LockRewardCondition,
        escrowReward: EscrowReward,
        accessSecretStoreCondition: AccessSecretStoreCondition,
    }

    /**
     * Templates instances.
     */
    public templates: {
        escrowAccessSecretStoreTemplate: EscrowAccessSecretStoreTemplate,
    }

    /**
     * Helpers for contracts.
     */
    public utils: {
        eventHandler: EventHandler,
    }

    /**
     * Returns a condition by address.
     * @param  {string} address Address of deployed condition.
     * @return {Condition} Condition instance.
     */
    public getConditionByAddress(address: string): Condition {
        return Object.values(this.conditions)
            .find((condition) => condition.getAddress() === address)
    }

    /**
     * Returns a template by name.
     * @param  {string} name Template name.
     * @return {AgreementTemplate} Agreement template instance.
     */
    public getTemplateByName(name: string): AgreementTemplate {
        return Object.values(this.templates)
            .find((template) => template.contractName === name)
    }

    /**
     * Returns a template by address.
     * @param  {string} address Template address.
     * @return {AgreementTemplate} Agreement template instance.
     */
    public getTemplateByAddress(address: string): AgreementTemplate {
        return Object.values(this.templates)
            .find((template) => template.getAddress() === address)
    }

    /**
     * Returns network id.
     * @return {Promise<number>} Network ID.
     */
    public getNetworkId(): Promise<number> {
        return this.web3.eth.net.getId()
    }

    /**
     * Returns the network by name.
     * @return {Promise<string>} Network name.
     */
    public getNetworkName(): Promise<string> {
        return this.web3.eth.net.getId()
            .then((networkId) => {
                let network: string = "Unknown"

                switch (networkId) {
                    case 1:
                        network = "Main"
                        break
                    case 2:
                        network = "Morden"
                        break
                    case 3:
                        network = "Ropsten"
                        break
                    case 4:
                        network = "Rinkeby"
                        break
                    case 77:
                        network = "POA_Sokol"
                        break
                    case 99:
                        network = "POA_Core"
                        break
                    case 42:
                        network = "Kovan"
                        break
                    case 8996:
                        network = "Spree"
                        // network = "ocean_poa_net_local"
                        break
                    case 8995:
                        network = "Nile"
                        break
                    default:
                        // Logger.log(`NetworkId ${networkId} not found defaulting`)
                        network = "Development"
                }
                return network
            })
    }
}

export default Keeper

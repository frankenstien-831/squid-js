import DIDRegistry from "./contracts/DIDRegistry"
import Dispenser from "./contracts/Dispenser"
import OceanToken from "./contracts/Token"
import { Condition, LockRewardCondition, EscrowReward, AccessSecretStoreCondition } from "./contracts/conditions"
import { AgreementTemplate, EscrowAccessSecretStoreTemplate } from "./contracts/templates"
import { TemplateStoreManager, AgreementStoreManager, ConditionStoreManager } from "./contracts/managers"

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

        const resolvedInstances = await Promise.all([
            // Main contracts
            Dispenser.getInstance(config),
            OceanToken.getInstance(config),
            DIDRegistry.getInstance(config),
            // Managers
            TemplateStoreManager.getInstance(config),
            AgreementStoreManager.getInstance(config),
            ConditionStoreManager.getInstance(config),
            // Conditions
            LockRewardCondition.getInstance(config),
            EscrowReward.getInstance(config),
            AccessSecretStoreCondition.getInstance(config),
            // Conditions
            EscrowAccessSecretStoreTemplate.getInstance(config),
        ])

        // Main contracts
        keeper.dispenser = resolvedInstances[0]
        keeper.token = resolvedInstances[1]
        keeper.didRegistry = resolvedInstances[2]
        // Managers
        keeper.templateStoreManager = resolvedInstances[3]
        keeper.agreementStoreManager = resolvedInstances[4]
        keeper.conditionStoreManager = resolvedInstances[5]
        // Conditions
        keeper.conditions = {
            lockRewardCondition: resolvedInstances[6],
            escrowReward: resolvedInstances[7],
            accessSecretStoreCondition: resolvedInstances[8],
        }
        // Conditions
        keeper.templates = {
            escrowAccessSecretStoreTemplate: resolvedInstances[9],
        }

        // Utils
        keeper.utils = {
            eventHandler: new EventHandler(config),
        }

        return keeper
    }

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
     * @param  {string}    address Address of deployed condition.
     * @return {Condition}         Condition instance.
     */
    public getConditionByAddress(address: string): Condition {
        return Object.values(this.conditions)
            .find((condition) => condition.getAddress() === address)
    }

    public getTemplateByName(name: string): AgreementTemplate {
        return Object.values(this.templates)
            .find((template) => template.contractName === name)
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

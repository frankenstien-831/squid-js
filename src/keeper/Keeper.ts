import OceanAuth from "./contracts/Auth"
import AccessConditions from "./contracts/conditions/AccessConditions"
import PaymentConditions from "./contracts/conditions/PaymentConditions"
import DIDRegistry from "./contracts/DIDRegistry"
import OceanMarket from "./contracts/Market"
import ServiceExecutionAgreement from "./contracts/ServiceExecutionAgreement"
import OceanToken from "./contracts/Token"

import Web3Provider from "./Web3Provider"

/**
 * Interface with Ocean Keeper contracts.
 * Ocean Keeper implementation where we put the following modules together:
 * - TCRs: users create challenges and resolve them through voting to maintain registries.
 * - Ocean Tokens: the intrinsic tokens circulated inside Ocean network, which is used in the voting of TCRs.
 * - Marketplace: the core marketplace where people can transact with each other with Ocean tokens.
 */
export default class Keeper {

    /**
     * Returns Keeper instance.
     * @return {Promise<Keeper>}
     */
    public static async getInstance(): Promise<Keeper> {

        if (Keeper.instance === null) {
            Keeper.instance = new Keeper()

            Keeper.instance.market = await OceanMarket.getInstance()
            Keeper.instance.auth = await OceanAuth.getInstance()
            Keeper.instance.token = await OceanToken.getInstance()
            Keeper.instance.serviceAgreement = await ServiceExecutionAgreement.getInstance()
            Keeper.instance.accessConditions = await AccessConditions.getInstance()
            Keeper.instance.paymentConditions = await PaymentConditions.getInstance()
            Keeper.instance.didRegistry = await DIDRegistry.getInstance()
        }
        return Keeper.instance
    }

    /**
     * Keeper instance.
     * @type {Keeper}
     */
    private static instance: Keeper = null

    /**
     * Ocean Token smart contract instance.
     * @type {OceanToken}
     */
    public token: OceanToken

    /**
     * Ocean Market smart contract instance.
     * @type {OceanMarket}
     */
    public market: OceanMarket

    /**
     * Ocean Auth smart contract instance.
     * @type {OceanAuth}
     */
    public auth: OceanAuth

    /**
     * Service agreement smart contract instance.
     * @type {ServiceExecutionAgreement}
     */
    public serviceAgreement: ServiceExecutionAgreement

    /**
     * Access conditions smart contract instance.
     * @type {AccessConditions}
     */
    public accessConditions: AccessConditions

    /**
     * Payment conditions smart contract instance.
     * @type {PaymentConditions}
     */
    public paymentConditions: PaymentConditions

    /**
     * DID registry smart contract instance.
     * @type {DIDRegistry}
     */
    public didRegistry: DIDRegistry

    /**
     * Returns the network by name.
     * @return {Promise<string>} Network name.
     */
    public async getNetworkName(): Promise<string> {
        return Web3Provider.getWeb3().eth.net.getId()
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

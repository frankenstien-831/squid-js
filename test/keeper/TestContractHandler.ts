import Contract from "web3-eth-contract"
import ContractHandler from "../../src/keeper/ContractHandler"
import Web3Provider from "../../src/keeper/Web3Provider"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
import FitchainCompute from "../../src/ocean/ServiceAgreements/Templates/FitchainCompute"
import Logger from "../../src/utils/Logger"

export default class TestContractHandler extends ContractHandler {

    public static async prepareContracts() {

        const web3 = Web3Provider.getWeb3()
        const deployerAddress = (await web3.eth.getAccounts())[0]

        // deploy contracts
        await TestContractHandler.deployContracts(deployerAddress)

        // register templates
        Logger.log(`Registering Access Template from ${deployerAddress}`)
        await new ServiceAgreementTemplate(new Access()).register(deployerAddress)
        Logger.log(`Registering FitchainCompute Template from ${deployerAddress}`)
        await new ServiceAgreementTemplate(new FitchainCompute()).register(deployerAddress)
    }

    private static async deployContracts(deployerAddress: string) {
        Logger.log("Trying to deploy contracts")

        // deploy libs
        /* not part of trilobite
        const dll = await ContractHandler.deployContract("DLL", deployerAddress)
        const attributeStore = await ContractHandler.deployContract("AttributeStore", deployerAddress)
        */
        // deploy contracts
        const token = await TestContractHandler.deployContract("OceanToken", deployerAddress)
        /* not part of trilobite
        const plcrVoting = await ContractHandler.deployContract("PLCRVoting", deployerAddress, {
            args: [token.options.address],
            tokens: [
                {
                    name: "DLL", address: dll.options.address,
                }, {
                    name: "AttributeStore", address: attributeStore.options.address,
                },
            ],
        })
        /* not part of trilobite
        const registry = await ContractHandler.deployContract("OceanRegistry", deployerAddress, {
            args: [token.options.address, plcrVoting.options.address],
        })
        */
        await TestContractHandler.deployContract("Dispenser", deployerAddress, {
            args: [token.options.address],
        })

        const sa = await TestContractHandler.deployContract("ServiceExecutionAgreement", deployerAddress, {
            args: [],
        })

        await TestContractHandler.deployContract("AccessConditions", deployerAddress, {
            args: [sa.options.address],
        })

        await TestContractHandler.deployContract("PaymentConditions", deployerAddress, {
            args: [sa.options.address, token.options.address],
        })

        await TestContractHandler.deployContract("DIDRegistry", deployerAddress, {})
    }

    private static async deployContract(name: string, from: string, params?): Promise<Contract> {

        // dont redeploy if there is already something loaded
        if (ContractHandler.has(name)) {
            return await ContractHandler.get(name)
        }

        const web3 = Web3Provider.getWeb3()

        let contractInstance: Contract
        try {
            Logger.log("Deploying", name)

            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${name}.development.json`)
            const tempContract = new web3.eth.Contract(artifact.abi, artifact.address)
            contractInstance = await tempContract.deploy({
                data: params && params.tokens ?
                    TestContractHandler.replaceTokens(artifact.bytecode.toString(), params.tokens) :
                    artifact.bytecode,
                arguments: params && params.args ? params.args : null,
            }).send({
                from,
                gas: 3000000,
                gasPrice: 10000000000,
            })
            TestContractHandler.set(name, contractInstance)
            // Logger.log("Deployed", name, "at", contractInstance.options.address);
        } catch (err) {
            Logger.error("Deployment failed for", name, "with params", JSON.stringify(params, null, 2), err.message)
            throw err
        }

        return contractInstance
    }

    private static replaceTokens(bytecode: string, tokens: any[]) {

        for (const token of tokens) {

            bytecode = bytecode.replace(
                new RegExp(`_+${token.name}_+`, "g"),
                token.address.replace("0x", ""))
        }
        // Logger.log(bytecode)

        return bytecode.toString()
    }
}

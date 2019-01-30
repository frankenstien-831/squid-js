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

        const token = await TestContractHandler.deployContract("OceanToken", deployerAddress, [deployerAddress])

        const dispenser = await TestContractHandler.deployContract("Dispenser", deployerAddress, [token.options.address, deployerAddress])

        // Add dispenser as Token minter
        await token.methods.addMinter(dispenser.options.address)
            .send({from: deployerAddress})

        const sa = await TestContractHandler.deployContract("ServiceExecutionAgreement", deployerAddress)

        await TestContractHandler.deployContract("AccessConditions", deployerAddress, [sa.options.address])

        await TestContractHandler.deployContract("PaymentConditions", deployerAddress, [sa.options.address, token.options.address])

        await TestContractHandler.deployContract("DIDRegistry", deployerAddress, [deployerAddress])
    }

    private static async deployContract(name: string, from: string, args: any[] = []): Promise<Contract> {

        // dont redeploy if there is already something loaded
        if (ContractHandler.has(name)) {
            return await ContractHandler.get(name)
        }

        const web3 = Web3Provider.getWeb3()

        let contractInstance: Contract
        try {
            Logger.log("Deploying", name)
            const sendConfig = {
                from,
                gas: 3000000,
                gasPrice: 10000000000,
            }
            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${name}.development.json`)
            const tempContract = new web3.eth.Contract(artifact.abi, artifact.address)
            const isZos = !!tempContract.methods.initialize
            contractInstance = await tempContract
                .deploy({
                    data: artifact.bytecode,
                    arguments: isZos ? undefined : args,
                })
                .send(sendConfig)
            if (isZos) {
                await contractInstance.methods.initialize(...args).send(sendConfig)
            }
            TestContractHandler.set(name, contractInstance)
            // Logger.log("Deployed", name, "at", contractInstance.options.address);
        } catch (err) {
            Logger.error("Deployment failed for", name, "with args", JSON.stringify(args, null, 2), err.message)
            throw err
        }

        return contractInstance
    }
}

import Web3Provider from "../keeper/Web3Provider"
import LoggerInstance from "./Logger"

export async function signText(text: string, publicKey: string, password?: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    try {
        return await web3.eth.personal.sign(text, publicKey, password)
    } catch (e) {
        LoggerInstance.error("Error on personal sign.")
        LoggerInstance.error(e)
        try {
            return await web3.eth.sign(text, publicKey, password)
        } catch (e2) {
            LoggerInstance.error("Error on sign.")
            LoggerInstance.error(e2)
            throw new Error("Error executing personal sign")
        }
    }
}

export async function verifyText(text: string, signature: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    return await web3.eth.personal.ecRecover(text, signature)
}

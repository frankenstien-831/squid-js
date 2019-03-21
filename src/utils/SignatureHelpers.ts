import * as Web3 from "web3"
import LoggerInstance from "./Logger"


export async function signText(web3: Web3, text: string, publicKey: string, password?: string): Promise<string> {
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

export async function verifyText(web3: Web3, text: string, signature: string): Promise<string> {
    return await web3.eth.personal.ecRecover(text, signature)
}

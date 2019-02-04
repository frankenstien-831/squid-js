import Web3Provider from '../keeper/Web3Provider'
import Logger from "./Logger"

export async function signText(text: string, publicKey: string, password?: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    try {
        return await web3.eth.personal.sign(text, publicKey, password)
    } catch (e) {
        Logger.error(e.message)
        throw new Error('Error execution personal sign')
    }
}

export async function verifyText(text: string, signature: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    return await web3.eth.personal.ecRecover(text, signature)
}

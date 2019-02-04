import Web3Provider from '../keeper/Web3Provider'

export async function signText(text: string, publicKey: string, password?: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    return await web3.eth.personal.sign(text, publicKey, password)
}

export async function verifyText(text: string, signature: string): Promise<string> {
    const web3 = Web3Provider.getWeb3()

    return await web3.eth.personal.ecRecover(text, signature)
}

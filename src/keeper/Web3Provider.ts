import Config from '../models/Config'
import Web3Types from 'web3'
const Web3 = require('web3')

export default class Web3Provider {
    /**
     * Returns Web3 instance.
     * @return {Web3}
     */
    public static getWeb3(config: Partial<Config> = {}): Web3Types {
        const provider =
            config.web3Provider ||
            Web3.givenProvider ||
            new Web3.providers.HttpProvider(config.nodeUri)

        return new Web3(provider)
    }
}

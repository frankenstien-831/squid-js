import Web3Provider from '../Web3Provider'
import ContractBase from './ContractBase'
import { zeroX, didPrefixed } from '../../utils'
import { InstantiableConfig } from '../../Instantiable.abstract'

export default class DIDRegistry extends ContractBase {
    public static async getInstance(
        config: InstantiableConfig
    ): Promise<DIDRegistry> {
        const didRegistry: DIDRegistry = new DIDRegistry('DIDRegistry')
        await didRegistry.init(config)
        return didRegistry
    }

    public async registerAttribute(
        did: string,
        checksum: string,
        providers: string[],
        value: string,
        ownerAddress: string
    ) {
        return this.send('registerAttribute', ownerAddress, [
            zeroX(did),
            zeroX(checksum),
            providers.map(zeroX),
            value
        ])
    }

    public async getDIDOwner(did: string): Promise<string> {
        return this.call('getDIDOwner', [zeroX(did)])
    }

    public async getBlockNumberUpdated(did: string): Promise<number> {
        return +(await this.call('getBlockNumberUpdated', [zeroX(did)]))
    }

    public async getAttributesByOwner(owner: string): Promise<string[]> {
        return (await this.getPastEvents('DIDAttributeRegistered', {
            _owner: zeroX(owner)
        }))
            .map(({ returnValues }) => returnValues._did)
            .map(didPrefixed)
    }
}

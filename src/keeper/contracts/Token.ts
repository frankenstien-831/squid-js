import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import ContractBase from "./ContractBase"

export default class OceanToken extends ContractBase {

    public static async getInstance(): Promise<OceanToken> {
        const token: OceanToken = new OceanToken("OceanToken")
        await token.init()
        return token
    }

    public async approve(marketAddress: string, price: number, buyerAddress: string): Promise<Receipt> {
        return this.send("approve", buyerAddress, [marketAddress, price])
    }

    public async balanceOf(address: string): Promise<number> {
        return this.call("balanceOf", [address])
            .then((balance: string) => new BigNumber(balance).toNumber())
    }

    public async transfer(to: string, amount: number, from: string): Promise<boolean> {
        return this.send("transfer", from, [to, amount])
    }
}

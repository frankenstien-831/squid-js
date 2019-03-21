import BigNumber from "bignumber.js"
import * as EthJsUtils from "ethereumjs-util"
import Balance from "../models/Balance"

import { Instantiable, InstantiableConfig } from "../Instantiable.abstract"

/**
 * Account information.
 */
export default class Account extends Instantiable {
    private password?: string

    constructor(private id: string = "0x0", config?: InstantiableConfig) {
        super()
        if (config) {
            this.setInstanceConfig(config)
        }
    }

    public getId() {
        return this.id
    }

    public setId(id) {
        this.id = id
    }

    /**
     * Set account password.
     * @param {string} password Password for account.
     */
    public setPassword(password: string): void {
        this.password = password
    }

    /**
     * Returns account password.
     * @return {string} Account password.
     */
    public getPassword(): string {
        return this.password
    }

    /**
     * Balance of Ocean Token.
     * @return {Promise<number>}
     */
    public async getOceanBalance(): Promise<number> {
        const token = this.ocean.keeper.token
        return await token.balanceOf(this.id) / (10 ** await token.decimals())
    }

    /**
     * Balance of Ether.
     * @return {Promise<number>}
     */
    public async getEtherBalance(): Promise<number> {
        return this.web3
            .eth
            .getBalance(this.id, "latest")
            .then((balance: string): number => {
                return new BigNumber(balance).toNumber()
            })
    }

    /**
     * Balances of Ether and Ocean Token.
     * @return {Promise<Balance>}
     */
    public async getBalance(): Promise<Balance> {
        return {
            eth: await this.getEtherBalance(),
            ocn: await this.getOceanBalance(),
        }
    }

    /**
     * Request Ocean Tokens.
     * @param  {number} amount Tokens to be requested.
     * @return {Promise<number>}
     */
    public async requestTokens(amount: number): Promise<number> {
        try {
            await this.ocean.keeper
                .dispenser
                .requestTokens(amount, this.id)
        } catch (e) {
            this.logger.error(e)
            throw new Error("Error requesting tokens")

        }
        return amount
    }

    /**
     * Returns the account public key.
     * @return {Promise<string>}
     */
    public async getPublicKey(): Promise<string> {
        const msg = this.web3.utils.sha3(this.getId())
        const sig = await this.web3.eth.sign(msg, this.getId())
        const {v, r, s} = EthJsUtils.fromRpcSig(sig)

        return EthJsUtils.ecrecover(EthJsUtils.toBuffer(msg), v, r, s).toString("hex")
    }
}

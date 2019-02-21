import Web3Provider from "../keeper/Web3Provider"
import Balance from "../models/Balance"
import Account from "./Account"

/**
 * Account submodule of Ocean Protocol.
 */
export default class OceanAccounts {

    /**
     * Returns the instance of OceanAccounts.
     * @return {Promise<OceanAccounts>}
     */
    public static async getInstance(): Promise<OceanAccounts> {
        if (!OceanAccounts.instance) {
            OceanAccounts.instance = new OceanAccounts()
        }

        return OceanAccounts.instance
    }

    /**
     * OceanAccounts instance.
     * @type {OceanAccounts}
     */
    private static instance: OceanAccounts = null

    /**
     * Returns the list of accounts.
     * @return {Promise<Account[]>}
     */
    public async list(): Promise<Account[]> {

        // retrieve eth accounts
        const ethAccounts = await Web3Provider.getWeb3().eth.getAccounts()

        return ethAccounts.map((address: string) => new Account(address))
    }

    /**
     * Return account balance.
     * @param  {Account}          account Account instance.
     * @return {Promise<Balance>}         Ether and Ocean Token balance.
     */
    public balance(account: Account): Promise<Balance> {
        return account.getBalance()
    }

    /**
     * Request tokens for a account.
     * @param  {Account}          account Account instance.
     * @param  {number}           amount  Token amount.
     * @return {Promise<boolean>}         Success.
     */
    public async requestTokens(account: Account, amount: number): Promise<boolean> {
        try {
            await account.requestTokens(amount)
            return true
        } catch (e) {
            return false
        }
    }
}

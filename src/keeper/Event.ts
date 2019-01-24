import Logger from "../utils/Logger"
import GenericContract from "./contracts/GenericContract"
import EventListener from "./EventListener"
import Web3Provider from "./Web3Provider"

export default class Event {

    private poller = null
    private lastBlock: number = 0
    private interval: number = 200

    constructor(private contractName: string,
                private eventName: string,
                private filter: any) {

    }

    public stopListen() {
        clearInterval(this.poller)
        this.poller = null
    }

    public async listen(callback: any) {
        this.lastBlock = await Web3Provider.getWeb3().eth.getBlockNumber() + 1

        this.poller = setInterval(
            () => this.handler(callback),
            this.interval)
    }

    public listenOnce(callback: any) {
        this.listen((events: any[]) => {
            if (events) {
                EventListener.unsubscribe(this)
                callback(events[0])
            }
        })
    }

    private async handler(callback: any) {
        const contract = await GenericContract.getInstance(this.contractName)

        if (this.lastBlock > await Web3Provider.getWeb3().eth.getBlockNumber()) {
            return
        }
        try {
            const events = await contract.getEventData(this.eventName, {
                filter: this.filter,
                fromBlock: this.lastBlock,
                toBlock: "latest",
            })

            if (events.length > 0) {
                this.lastBlock = events[events.length - 1].blockNumber + 1
                callback(events)
            }
        } catch (err) {
            Logger.log(err)
        }
    }
}

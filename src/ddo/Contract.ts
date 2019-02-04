import Event from "./Event"

export interface Contract {
    contractName: string
    fulfillmentOperator: number
    events: Event[]
}

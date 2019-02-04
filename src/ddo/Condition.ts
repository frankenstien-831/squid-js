import { Event } from "./Event"

export interface Parameter {
    name: string
    type: string
    value: any
}

export interface Dependency {
    /**
     * @example "lockPayment"
     */
    name: string
    /**
     * @example 0
     */
    timeout: number
}

export interface Condition {
    name: string
    /**
     * @example "AccessCondition"
     */
    contractName: string
    /**
     * @example "lockPayment"
     */
    functionName: string
    /**
     * @example 0
     */
    timeout: number
    /**
     * @example "0x12122434"
     */
    conditionKey: string
    parameters: Parameter[]
    events: Event[]
    /**
     * @example []
     */
    dependencies: Dependency[]
    /**
     * @example false
     */
    isTerminalCondition: boolean
}

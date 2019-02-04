export interface EventHandler {
    /**
     * @example "serviceAgreement"
     */
    moduleName: string
    /**
     * @example "fulfillAgreement"
     */
    functionName: string
    /**
     * @example "0.1"
     */
    version: string
}

export interface Event {
    name: string
    actorType: string
    handler: EventHandler
}

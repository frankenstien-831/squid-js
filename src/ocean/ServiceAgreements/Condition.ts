import { Event } from "../../ddo/Event"
import MethodReflection from "../../models/MethodReflection"
import Parameter from "./Parameter"

export default class Condition {
    public methodReflection: MethodReflection
    public condtionKey: string
    public dependencies: string[]
    public dependencyTimeoutFlags: number[]
    public isTerminalCondition: boolean
    public timeout: number
    public events: Event[]
    public parameters: Parameter[]
}

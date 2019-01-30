import Event from "../Event"
import EventHandler from "../EventHandler"
import Method from "../Method"
import Parameter from "../Parameter"
import TemplateBase from "./TemplateBase"

export default class Access extends TemplateBase {

    public templateName: string = "Access"
    public id: string = "0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d"
    public Methods: Method[] = [
        {
            name: "lockPayment",
            contractName: "PaymentConditions",
            methodName: "lockPayment",
            timeout: 0,
            parameters: [
                {
                    name: "assetId",
                    type: "bytes32",
                } as Parameter, {
                    name: "price",
                    type: "uint256",
                } as Parameter,
            ],
            events: [
                {
                    name: "PaymentLocked",
                    actorType: "publisher",
                    handler: {
                        moduleName: "accessControl",
                        functionName: "grantAccess",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
            ],
            dependencies: [],
            dependencyTimeoutFlags: [],
            isTerminalCondition: false,
        } as Method, {
            name: "grantAccess",
            contractName: "AccessConditions",
            methodName: "grantAccess",
            timeout: 0,
            parameters: [
                {
                    name: "documentKeyId",
                    type: "bytes32",
                } as Parameter,
            ],
            events: [
                {
                    name: "AccessGranted",
                    actorType: "publisher",
                    handler: {
                        moduleName: "payment",
                        functionName: "releasePayment",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
                {
                    name: "AccessGranted",
                    actorType: "consumer",
                    handler: {
                        moduleName: "accessControl",
                        functionName: "consumeAsset",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
                {
                    name: "AccessTimeout",
                    actorType: "consumer",
                    handler: {
                        moduleName: "payment",
                        functionName: "refundPayment",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
            ],
            dependencies: ["lockPayment"],
            dependencyTimeoutFlags: [0],
            isTerminalCondition: false,
        } as Method, {
            name: "releasePayment",
            contractName: "PaymentConditions",
            methodName: "releasePayment",
            timeout: 0,
            parameters: [
                {
                    name: "assetId",
                    type: "bytes32",
                } as Parameter, {
                    name: "price",
                    type: "uint256",
                } as Parameter,
            ],
            events: [
                {
                    name: "PaymentReleased",
                    actorType: "consumer",
                    handler: {
                        moduleName: "serviceAgreement",
                        functionName: "fulfillAgreement",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
            ],
            dependencies: ["grantAccess"],
            dependencyTimeoutFlags: [0],
            isTerminalCondition: true,
        } as Method, {
            name: "refundPayment",
            contractName: "PaymentConditions",
            methodName: "refundPayment",
            timeout: 10 * 60,
            parameters: [
                {
                    name: "assetId",
                    type: "bytes32",
                } as Parameter, {
                    name: "price",
                    type: "uint256",
                } as Parameter,
            ],
            events: [
                {
                    name: "PaymentRefund",
                    actorType: "publisher",
                    handler: {
                        moduleName: "serviceAgreement",
                        functionName: "terminateAgreement",
                        version: "0.1",
                    } as EventHandler,
                } as Event,
            ],
            dependencies: ["lockPayment", "grantAccess"],
            dependencyTimeoutFlags: [0, 1],
            isTerminalCondition: true,
        } as Method,
    ]
}

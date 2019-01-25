import {Logger} from "../squid"

export function runner(fn: () => Promise<any>) {
    fn()
        .then(() => process.exit(0))
        .catch((e) => {
            Logger.error(e)
            process.exit(1)
        })
}

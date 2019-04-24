import { SubscribableObserver } from "./SubscribableObserver"

export class SubscribablePromise<T extends any, P extends any> {
    private observer = new SubscribableObserver<T, P>()
    private promise = Object.assign(
        new Promise<P>((resolve, reject) => {
            setTimeout(() => {
                this.observer
                    .subscribe(undefined, resolve, reject)
            }, 0)
        }),
        this,
    )

    constructor(executor: (observer: SubscribableObserver<T, P>) => void | Promise<P>) {
        const execution = executor(this.observer)

        Promise.resolve(execution as any)
            .then((result) => {
                if (Promise.resolve(execution as any) === execution) {
                    this.observer.complete(result)
                }
            })
    }

    public subscribe(onNext: (next: T) => void) {
        return this.observer.subscribe(onNext)
    }

    public next(onNext: (next: T) => void) {
        this.observer.subscribe(onNext)
        return this
    }

    public then(onfulfilled?: (value: P) => any, onrejected?: (error: any) => any) {
        return Object.assign(this.promise.then(onfulfilled, onrejected), this)
    }

    public catch(onrejected?: (error: any) => any) {
        return Object.assign(this.promise.catch(onrejected), this)
    }

    public finally(onfinally?: () => any) {
        return Object.assign(this.promise.finally(onfinally), this)
    }
}

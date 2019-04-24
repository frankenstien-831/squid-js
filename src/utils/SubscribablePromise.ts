export class SubscribableObserver<T, P> {
    public completed: boolean = false
    private subscriptions = new Set<{onNext?: (next: T) => void, onComplete?: (complete: P) => void, onError?: (error: any) => void}>()

    subscribe(onNext?: (next: T) => void, onComplete?: (complete: P) => void, onError?: (error: any) => void) {
        if (this.completed) {
            throw new Error("Observer completed.")
        }
        const subscription = {onNext, onComplete, onError}
        this.subscriptions.add(subscription)

        return {
            unsubscribe: () => this.subscriptions.delete(subscription),
        }
    }

    next(next?: T): void {
        this.emit('onNext', next)
    }

    complete(resolve?: P): void {
        this.emit('onComplete', resolve)
        this.unsubscribe()
    }

    error(error?: any): void {
        this.emit('onError', error)
        this.unsubscribe()
    }

    private emit(type: 'onNext' | 'onComplete' | 'onError', value: any) {
        Array.from(this.subscriptions)
            .map(subscription => subscription[type])
            .filter(callback => callback && typeof callback === 'function')
            .forEach(callback => callback(value))
    }

    private unsubscribe() {
        this.completed = true
        this.subscriptions.clear()
    }
}

export class SubscribablePromise<T extends any, P extends any> {
    private observer = new SubscribableObserver<T, P>()
    private promise = Object.assign(
        new Promise<P>((resolve, reject) => {
            setTimeout(() => {
                this.observer
                    .subscribe(undefined, resolve, reject)
            })
        }),
        this,
    )

    constructor(executor: (observer: SubscribableObserver<T, P>) => void | Promise<P>) {
        const execution = executor(this.observer)

        Promise.resolve(execution as any)
            .then(result => {
                if (Promise.resolve(execution as any) == execution) {
                    this.observer.complete(result)
                }
            })
    }

    subscribe(onNext: (next: T) => void) {
        return this.observer.subscribe(onNext)
    }

    next(onNext: (next: T) => void) {
        this.observer.subscribe(onNext)
        return this
    }

    then(onfulfilled?: (value: P) => any, onrejected?: (error: any) => any) {
        return Object.assign(this.promise.then(onfulfilled, onrejected), this)
    }

    catch(onrejected?: (error: any) => any) {
        return Object.assign(this.promise.catch(onrejected), this)
    }

    finally(onfinally?: () => any) {
        return Object.assign(this.promise.finally(onfinally), this)
    }
}

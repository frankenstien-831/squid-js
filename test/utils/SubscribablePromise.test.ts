import { assert, expect, spy, use } from "chai"
import * as spies from "chai-spies"

import { SubscribableObserver, SubscribablePromise } from "../../src/utils/SubscribablePromise"

use(spies)

describe("SubscribableObserver", () => {

    describe("#subscribe()", () => {

        it("should be able to add a subcription", async () => {
            const observer = new SubscribableObserver()
            const subscription = observer.subscribe()

            assert.isDefined(subscription.unsubscribe)
            assert.typeOf(subscription.unsubscribe, 'function')
        })

        it("should be able to unsubscribe", async () => {
            const observer = new SubscribableObserver()
            const subscription = observer.subscribe()

            subscription.unsubscribe()
        })
    })

    describe("#next()", () => {

        it("should be able to emit next value", async () => {
            const onNextSpy = spy()
            const observer = new SubscribableObserver()
            observer.subscribe(onNextSpy)

            observer.next('test')
            expect(onNextSpy).to.has.been.called.with('test')

            observer.next('test')
            expect(onNextSpy).to.has.been.called.exactly(2)
        })
    })

    describe("#complete()", () => {

        it("should be able to complete", async () => {
            const onCompleteSpy = spy()
            const observer = new SubscribableObserver()
            observer.subscribe(undefined, onCompleteSpy)

            observer.complete('test')
            expect(onCompleteSpy).to.has.been.called.with('test')

            observer.complete('test')
            expect(onCompleteSpy).to.has.been.called.exactly(1)

            assert.isTrue(observer.completed)
        })
    })

    describe("#error()", () => {

        it("should be able to emit a error", async () => {
            const onErrorSpy = spy()
            const observer = new SubscribableObserver()
            observer.subscribe(undefined, undefined, onErrorSpy)

            observer.error('test')
            expect(onErrorSpy).to.has.been.called.with('test')

            observer.error('test')
            expect(onErrorSpy).to.has.been.called.exactly(1)

            assert.isTrue(observer.completed)
        })
    })
})

describe("SubscribablePromise", () => {

    it("should work", async () => {
        const subscribible = new SubscribablePromise(() => {})

        assert.isDefined(subscribible)
    })

    describe("#subscribe()", () => {

        it("should return a subscription", async () => {
            const subscribible = new SubscribablePromise(() => {})
            const subscription = subscribible.subscribe(() => {})

            assert.isDefined(subscription)
            assert.isDefined(subscription.unsubscribe)
            assert.typeOf(subscription.unsubscribe, 'function')
        })

        it("should listen the next values", (done) => {
            const onNextSpy = spy()
            const subscribible = new SubscribablePromise(observer => {
                setTimeout(() => observer.next('test'), 10)
                setTimeout(() => observer.next('test'), 20)
            })
            subscribible.subscribe(onNextSpy)

            setTimeout(() => {
                expect(onNextSpy).to.has.been.called.with('test')
                expect(onNextSpy).to.has.been.called.exactly(2)
                done()
            }, 100)
        })
    })

    describe("#then()", () => {

        it("should resolve", (done) => {
            const onCompleteSpy = spy()
            const onFinallySpy = spy()
            const subscribible = new SubscribablePromise(observer => {
                setTimeout(() => observer.next('test'), 10)
                setTimeout(() => observer.complete('test'), 20)
            })

            subscribible
                .then(onCompleteSpy)
                .finally(onFinallySpy)

            setTimeout(() => {
                expect(onCompleteSpy).to.has.been.called.with('test')
                expect(onCompleteSpy).to.has.been.called.exactly(1)
                expect(onFinallySpy).to.has.been.called.exactly(1)
                done()
            }, 100)
        })
    })

    describe("#error()", () => {

        it("should catch the error", (done) => {
            const onErrorSpy = spy()
            const onFinallySpy = spy()
            const subscribible = new SubscribablePromise(observer => {
                setTimeout(() => observer.next('test'), 10)
                setTimeout(() => observer.error('test'), 20)
            })

            subscribible
                .catch(onErrorSpy)
                .finally(onFinallySpy)

            setTimeout(() => {
                expect(onErrorSpy).to.has.been.called.with('test')
                expect(onErrorSpy).to.has.been.called.exactly(1)
                expect(onFinallySpy).to.has.been.called.exactly(1)
                done()
            }, 100)
        })
    })

    it("should be able to subscribe and wait for a promise", async () => {
        const onNextSpy = spy()
        const subscribible = new SubscribablePromise(observer => {
            setTimeout(() => observer.next('test'), 10)
            setTimeout(() => observer.next('test'), 20)
            setTimeout(() => observer.complete('completed'), 30)
        })

        const result = await subscribible
            .next(onNextSpy)

        expect(onNextSpy).to.has.been.called.with('test')
        expect(onNextSpy).to.has.been.called.exactly(2)

        assert.equal(result, 'completed')
    })

    it("should use the result of a the promise as executor to complete the observer", async () => {
        const onNextSpy = spy()
        const subscribible = new SubscribablePromise(async observer => {
            await new Promise(resolve => setTimeout(resolve, 10))
            observer.next('test')
            await new Promise(resolve => setTimeout(resolve, 10))
            observer.next('test')
            await new Promise(resolve => setTimeout(resolve, 10))
            return 'completed'
        })

        const result = await subscribible
            .next(onNextSpy)

        expect(onNextSpy).to.has.been.called.with('test')
        expect(onNextSpy).to.has.been.called.exactly(2)

        assert.equal(result, 'completed')
    })
})

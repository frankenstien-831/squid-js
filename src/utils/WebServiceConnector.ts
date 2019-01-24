import fetch, { BodyInit, RequestInit, Response } from "node-fetch"
import Logger from "./Logger"

/**
 * Provides a common interface to web services.
 */
export default class WebServiceConnector {

    public post(url: string, payload: BodyInit): Promise<Response> {
        return this.fetch(url, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public get(url: string): Promise<Response> {
        return this.fetch(url, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public put(url: string, payload: BodyInit): Promise<Response> {
        return this.fetch(url, {
            method: "PUT",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    private async fetch(url: string, opts: RequestInit): Promise<Response> {
        const result = await fetch(url, opts)
        if (!result.ok) {
            Logger.warn(`Error requesting [${opts.method}] ${url}`)
            Logger.warn(`Response message: \n${await result.text()}`)
            throw result
        }
        return result
    }
}

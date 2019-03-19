import fetch, { BodyInit, RequestInit, Response } from "node-fetch"
import LoggerInstance from "./Logger"

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
            LoggerInstance.error(`Error requesting [${opts.method}] ${url}`)
            LoggerInstance.error(`Response message: \n${await result.text()}`)
            throw result
        }
        return result
    }
}

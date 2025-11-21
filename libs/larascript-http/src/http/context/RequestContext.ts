import { IPContextData, IRequestContext, IRequestContextData, TBaseRequest } from "@larascript-framework/contracts/http";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import getIpAddress from "../utils/getIpAddress.js";

/**
 * Current request service
 * 
 * - Stores the current request context
 * - Store the current IP context
 */
export class RequestContext extends BaseSingleton implements IRequestContext {

    /**
     * Request context
     * 
     * Example of how the values object looks like:
     *     {
     *         '<request uuid string>': {
     *             'key': unknown,
     *             'key2': unknown
     *         }
     *     }
     */
    protected requestContext: IRequestContextData = new Map();

    /**
     * IP context
     * 
     * Example of how the values object looks like:
     *     {
     *         '127.0.0.1': {
     *             'key': unknown,
     *             'key2': unknown
     *         }
     *     }
     */
    protected ipContext: IPContextData = new Map();

    /**
     * Sets a value in the current request context
     *
     * @param {TBaseRequest} req - The Express Request object
     * @param {string} key - The key of the value to set
     * @param {unknown} value - The value associated with the key
     * @returns {typeof RequestContext} - The CurrentRequest class itself to enable chaining
     */
    public setByRequest<T = unknown>(req: TBaseRequest, key: string, value: T): this {
        const requestId = req.id as string;

        if(!this.requestContext.has(requestId)) {
            this.requestContext.set(requestId, new Map());
        }

        this.requestContext.get(requestId)!.set(key, value);

        return this;
    }

    /**
     * Gets a value from the current request context
     *
     * @param {TBaseRequest} req - The Express Request object
     * @param {string} key - The key of the value to retrieve
     * @returns {T | undefined} - The value associated with the key, or undefined if not found
     */
    public getByRequest<T = unknown>(req: TBaseRequest, key?: string): T | undefined {
        const requestId = req.id as string;

        if (!key) {
            return this.requestContext.get(requestId) as T ?? undefined;
        }

        return this.requestContext.get(requestId)?.get(key) as T ?? undefined
    }

    /**
     * Sets a value in the current request context by the request's IP address.
     * 
     * If the ttlSeconds is not provided, the value will be stored indefinitely (only in memory).
     *
     * @param {TBaseRequest} req - The Express Request object
     * @param {string} key - The key of the value to set
     * @param {unknown} value - The value associated with the key
     * @returns {typeof RequestContext} - The CurrentRequest class itself to enable chaining
     */
    public setByIpAddress<T = unknown>(req: TBaseRequest, key: string, value: T, ttlSeconds?: number): this {
        const ip = getIpAddress(req);

        if(!this.ipContext.has(ip)) {
            this.ipContext.set(ip, new Map());
        }

        this.ipContext.get(ip)!.set(key, {
            createdAt: new Date(),
            value,
            ttlSeconds: ttlSeconds ?? null
        })

        return this;
    }

    /**
     * Gets a value from the current request context by the request's IP address
     *
     * @param {TBaseRequest} req - The Express Request object
     * @param {string} [key] - The key of the value to retrieve
     * @returns {T | undefined} - The value associated with the key, or undefined if not found
     */
    public getByIpAddress<T = unknown>(req: TBaseRequest, key?: string): T | undefined {
        const ip = getIpAddress(req);

        if (!key) {
            return this.ipContext.get(ip) as T ?? undefined;
        }

        return this.ipContext.get(ip)?.get(key) as T ?? undefined
    }

    /**
     * Ends the current request context and removes all associated values
     *
     * @param {TBaseRequest} req - The Express Request object
     * @returns {void}
     */
    public endRequestContext(req: TBaseRequest) {
        const requestId = req.id as string;
        this.requestContext.delete(requestId);
    }

    /**
     * Returns the current request context data
     *
     * @returns {Record<string, unknown>} - The current request context data
     */
    public getRequestContext(): IRequestContextData {
        return this.requestContext
    }

    /**
     * Sets the current request context data
     *
     * @param {Record<string, Record<string, unknown>>} context - The current request context data
     * @returns {this} - The CurrentRequest class itself to enable chaining
     */
    public setRequestContext(context: IRequestContextData): this {
        this.requestContext = context;
        return this;
    }
    
    /**
     * Returns the current ip context data
     *
     * @returns {IPContextData} - The current ip context data
     */
    public getIpContext(): IPContextData {
        return this.ipContext
    }

    /**
     * Sets the current ip context data
     *
     * @param {IPContextData} context - The current ip context data
     * @returns {this} - The CurrentRequest class itself to enable chaining
     */
    public setIpContext(context: IPContextData): this {
        this.ipContext = context;
        return this;
    }

}

export default RequestContext
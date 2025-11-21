
import { NextFunction, Request, Response } from "express";
import HttpContext from "../context/HttpContext.js";
import responseError from "../handlers/responseError.js";
import { ICreateExpressHandler, IHttpContext, IMiddleware, MiddlewareConstructor, TBaseRequest, TExpressMiddlewareFn, TRouteItem } from "../interfaces/index.js";
;

/**
 * Abstract base class that transforms Express middleware into a class-based format.
 * 
 * This class provides an object-oriented way to write Express middleware by:
 * 
 * 1. Converting the function-based middleware pattern (req, res, next) into a class
 *    with an execute() method that receives a unified HttpContext
 * 
 * 2. Adding type-safe configuration management through generics and config methods
 * 
 * 3. Providing static and instance methods to convert back to Express middleware format
 *    when needed (createExpressMiddleware() and toExpressable())
 * 
 * Example usage:
 * ```
 * class LoggerMiddleware extends Middleware {
 *   async execute(context: HttpContext) {
 *     console.log(`${context.getRequest().method}: ${context.getRequest().path}`);
 *     this.next();
 *   }
 * }
 * 
 * // Use with Express
 * app.use(LoggerMiddleware.createExpressMiddleware())
 * ```
 * 
 * This abstraction helps organize middleware code into maintainable, testable classes
 * while maintaining full compatibility with Express's middleware system.
 */

export abstract class Middleware<Config extends unknown = unknown> implements IMiddleware, ICreateExpressHandler<TExpressMiddlewareFn> {

    /**
     * @type {Config}
     */
    config!: Config;

    /**
     * @type {HttpContext}
     */
    protected context!: HttpContext;

    /**
     * Alias for createExpressMiddleware
     * @param config The configuration for the middleware
     * @param routeItem The route item for the middleware
     * @returns The middleware instance
     */
    public static create<Middleware extends IMiddleware = IMiddleware>(config?: Middleware['config'], routeItem?: TRouteItem): TExpressMiddlewareFn {
        return this.createExpressMiddleware(config, routeItem)
    }

    /**
     * Converts this middleware class into an Express-compatible middleware function.
     * Creates a new instance of this class and returns its Express middleware function,
     * allowing it to be used directly with Express's app.use() or route handlers.
     */
    public static createExpressMiddleware<Middleware extends IMiddleware = IMiddleware>(config?: Middleware['config'], routeItem?: TRouteItem): TExpressMiddlewareFn {
        const middleware = new (this as unknown as MiddlewareConstructor)()

        if(typeof config !== 'undefined') {
            middleware.setConfig(config)
        }

        return middleware.toExpressHandler(routeItem)
    }

    /**
     * @param {Config} config
     */
    public setConfig(config: Config): IMiddleware<Config> {
        this.config = config;
        return this as unknown as IMiddleware<Config>;
    }


    /**
     * @returns {Config}
     */
    public getConfig(): Config {
        if(!this.config) {
            throw new Error('Config not set');
        }

        return this.config;
    }

    /**
     * @param {HttpContext} context
     */
    public setContext(context: HttpContext) {
        this.context = context;
    }

    /**
     * @returns {HttpContext}
     */
    public getContext(): HttpContext {
        return this.context;
    }

    /**
     * Executes the next middleware function in the chain by calling
     * the stored next() callback from the HttpContext
     */
    public next(): void {
        this.context.getNext()?.();
    }

    /**
     * @returns {TExpressMiddlewareFn}
     */
    public toExpressHandler(routeItem?: TRouteItem): TExpressMiddlewareFn {
        return async (req: Request, res: Response, next: NextFunction | undefined) => {
            try {
                const context = new HttpContext(req as TBaseRequest, res, next, routeItem)
                this.setContext(context)
                await this.execute(context)

            }
            catch(err) {
                responseError(req, res, err as Error)
            }
        }
    }

    /**
     * @abstract
     * @param {HttpContext} context
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-unused-vars
    public abstract execute(context: IHttpContext): Promise<void>;

}

export default Middleware;
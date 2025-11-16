import { NextFunction, Request, Response } from "express";
import { ICreateExpressHandler, IHttpContext } from "./index.js";
import { TRouteItem } from "./IRouter.js";


/**
 * Represents a callback function that can be used to validate a security rule.
 * This type defines a function that:
 * 
 * 1. Takes Express Request, Response, and optional NextFunction parameters
 * 2. Can be synchronous (returning boolean) or asynchronous (returning Promise<boolean>)
 * 3. Returns true if the rule passes validation, false if it fails
 * 
 * This is commonly used in security middleware to implement custom validation logic,
 * like checking user roles, rate limits, or resource ownership.
 */
export type MiddlewareConstructor = {
    new (...args: any[]): IMiddleware;
    create(config?: unknown, routeItem?: TRouteItem): TExpressMiddlewareFn;
}

/**
 * Represents a constructor type for middleware classes.
 * This type defines the shape of a middleware class constructor that:
 * 
 * 1. Can be instantiated with any number of arguments (...args: any[])
 * 2. Returns a new instance of IMiddleware
 * 3. Has a static method createExpressMiddleware that converts the middleware class 
 *    into an Express-compatible middleware function
 *
 * This allows middleware to be defined as classes while still being compatible
 * with Express's middleware system through the createExpressMiddleware conversion.
 */
export interface IMiddleware<Config extends unknown = unknown> extends ICreateExpressHandler<TExpressMiddlewareFn> {
    config: Config;
    getContext(): IHttpContext;
    setConfig(config: Config): IMiddleware;
    execute(context: IHttpContext): Promise<void>;
    next(): void;
}


/**
 * Represents either an Express middleware function or a middleware class constructor.
 * This type allows middleware to be specified either as:
 * 1. A function that follows the Express middleware pattern (TExpressMiddlewareFn)
 * 2. A class constructor that creates a middleware instance (MiddlewareConstructor)
 * 
 * This flexibility enables both functional and class-based middleware approaches.
 */
export type TExpressMiddlewareFnOrClass = TExpressMiddlewareFn | MiddlewareConstructor;

/**
 * Represents an Express middleware function. The function takes an Express Request,
 * Response, and NextFunction as arguments and may return a Promise that resolves
 * to void or may return void directly.
 *
 * @param req - The Express Request object
 * @param res - The Express Response object
 * @param next - The Express NextFunction object
 * @returns A Promise that resolves to void or void directly
 */
export type TExpressMiddlewareFn = (req: Request, res: Response, next?: NextFunction, ...args: any[]) => Promise<void> | void;


/**
 * Represents a callback function that can be used to validate a security rule.
 * This type defines a function that:
 * 
 * 1. Takes Express Request, Response, and optional NextFunction parameters
 * 2. Can be synchronous (returning boolean) or asynchronous (returning Promise<boolean>)
 * 3. Returns true if the rule passes validation, false if it fails
 */
export type TRuleCallbackFn = (req: Request, res: Response, next?: NextFunction) => Promise<boolean> | boolean;
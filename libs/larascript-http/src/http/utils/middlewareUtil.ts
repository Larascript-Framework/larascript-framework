import Middleware from "@/http/base/Middleware.js";
import { MiddlewareConstructor, TExpressMiddlewareFn, TExpressMiddlewareFnOrClass, TRouteItem } from "@larascript-framework/contracts/http";
import express from "express";

/**
 * Utility class for handling middleware conversions and transformations.
 * 
 * This class provides static methods to convert between different middleware formats,
 * specifically handling the conversion of custom middleware classes and Express middleware
 * functions into a standardized Express middleware format.
 * 
 * The main purpose is to allow the application to work with both:
 * 1. Class-based middlewares (extending the base Middleware class)
 * 2. Standard Express middleware functions
 * 
 * This flexibility enables better organization and structure of middleware logic while
 * maintaining compatibility with Express's middleware system.
 */
class MiddlewareUtil {

    /**
     * Converts an array of middleware classes and middleware functions into an array of Express middleware functions.
     * 
     * @param routeItem The route item containing the middlewares
     * @returns An array of Express middleware functions
     */
    static convertToExpressMiddlewares(fnAndClassMiddlewares: (express.RequestHandler | TExpressMiddlewareFnOrClass)[], routeItem?: TRouteItem): TExpressMiddlewareFn[] {

        // A mix of middleware classes and middleware functions
        const middlewaresArray = (
            Array.isArray(fnAndClassMiddlewares) 
                ? fnAndClassMiddlewares 
                : [fnAndClassMiddlewares]
        ) as (express.RequestHandler | TExpressMiddlewareFnOrClass)[]

        // Convert middleware classes to middleware functions
        return middlewaresArray.map(middleware => {
            if(middleware.prototype instanceof Middleware) {
                return (middleware as MiddlewareConstructor).create(undefined, routeItem)
            }

            return middleware as TExpressMiddlewareFn
        })
    } 

}

export default MiddlewareUtil;
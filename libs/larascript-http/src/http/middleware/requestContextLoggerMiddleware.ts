import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import { EnvironmentDevelopment } from "@larascript-framework/larascript-core";
import Middleware from "../base/Middleware.js";
import HttpContext from "../context/HttpContext.js";

/**
 * Middleware to log the request context
 */
export class RequestContextLoggerMiddleware extends Middleware {

    async execute(context: HttpContext): Promise<void> {
        if (HttpEnvironment.getInstance().environment !== EnvironmentDevelopment) {
            this.next()
            return;
        }

        context.getResponse().once('finish', () => {
            HttpEnvironment.getInstance().loggerService?.info('requestContext: ', HttpEnvironment.getInstance().requestContext.getRequestContext())
            HttpEnvironment.getInstance().loggerService?.info('ipContext: ', HttpEnvironment.getInstance().requestContext.getIpContext())
        })

        this.next()
    }

}


export default RequestContextLoggerMiddleware
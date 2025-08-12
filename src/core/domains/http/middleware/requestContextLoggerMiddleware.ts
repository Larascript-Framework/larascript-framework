import { EnvironmentDevelopment } from "@ben-shepherd/larascript-core";
import Middleware from "@src/core/domains/http/base/Middleware";
import HttpContext from "@src/core/domains/http/context/HttpContext";
import { app, appEnv } from "@src/core/services/App";

/**
 * Middleware to log the request context
 */
class RequestContextLoggerMiddleware extends Middleware {

    async execute(context: HttpContext): Promise<void> {
        if (appEnv() !== EnvironmentDevelopment) {
            this.next()
            return;
        }

        context.getResponse().once('finish', () => {
            app('logger').info('requestContext: ', app('requestContext').getRequestContext())
            app('logger').info('ipContext: ', app('requestContext').getIpContext())
        })

        this.next()
    }

}


export default RequestContextLoggerMiddleware
import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import Middleware from "../base/Middleware.js";
import HttpContext from "../context/HttpContext.js";

/**
 * Middleware that ends the current request context and removes all associated values.
 */
export class EndRequestContextMiddleware extends Middleware {

    /**
     * Executes the end request context middleware
     * 
     * @param context - The HTTP context containing request and response objects
     */
    async execute(context: HttpContext): Promise<void> {
        context.getResponse().once('finish', () => {
            HttpEnvironment.getInstance().requestContext.endRequestContext(context.getRequest())
        })

        this.next()
    }

}

export default EndRequestContextMiddleware
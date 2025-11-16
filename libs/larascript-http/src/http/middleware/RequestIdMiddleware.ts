import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import Middleware from "../base/Middleware.js";
import HttpContext from "../context/HttpContext.js";

type Options = {
    // eslint-disable-next-line no-unused-vars
    generator: (...args: any[]) => string;
    setHeader: boolean;
    headerName: string;
}

const defaultOptions: Options = {
    generator: generateUuidV4,
    setHeader: true,
    headerName: 'X-Request-Id'
}

/**
 * RequestIdMiddleware adds a unique identifier to each HTTP request.
 * 
 * This identifier serves as a correlation ID that can be used to track a request
 * throughout its entire lifecycle across the application. The ID is:
 * 
 * 1. Generated using the configured generator (defaults to UUID v4)
 * 2. Added to the request object as 'id' property
 * 3. Optionally included in response headers (X-Request-Id by default)
 * 
 * Having a request ID enables:
 * - Correlation of logs across different parts of the application
 * - Tracking request flow through microservices
 * - Debugging by following a specific request's journey.
 */

export class RequestIdMiddleware extends Middleware<Options> {

    /**
     * Constructor for the RequestIdMiddleware
     * 
     * @param options - The options for the middleware
     */
    constructor({ generator, setHeader, headerName }: Options = defaultOptions) {
        super()
        this.setConfig({
            generator,
            setHeader,
            headerName
        })
    }

    /**
     * Executes the request ID middleware
     * 
     * Generates a unique request ID and adds it to the request object.
     * Optionally sets the ID in the response headers.
     * 
     * @param context - The HTTP context containing request and response objects
     */
    async execute(context: HttpContext): Promise<void> {
        const { generator, setHeader, headerName } = this.getConfig()
        
        const oldValue = context.getRequest().get(headerName)
        const id =  oldValue ?? generator()
    
        if(setHeader) {
            context.getResponse().set(headerName, id)
        }
    
        context.getRequest().id = id
        this.next()
    }

}


export default RequestIdMiddleware
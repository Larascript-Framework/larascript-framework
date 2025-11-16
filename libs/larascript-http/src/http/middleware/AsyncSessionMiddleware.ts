import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import Middleware from "../base/Middleware.js";
import HttpContext from "../context/HttpContext.js";

/**
 * Middleware that initializes a session context for each HTTP request.
 * 
 * This middleware runs after the RequestIdMiddleware and uses the generated request ID
 * as the session identifier. It ensures that all subsequent middleware and request handlers
 * have access to a consistent session context throughout the request lifecycle.
 * 
 * The session context is important for:
 * - Maintaining request-scoped state
 * - Tracking user context
 * - Managing request-specific data
 * 
 * @example
 * // Typically registered in the HTTP service configuration:
 * app.use(AsyncSessionMiddleware.create())
 */
export class AsyncSessionMiddleware extends Middleware {
    public async execute(context: HttpContext): Promise<void> {
        
        const sessionId = context.getId();
        if(typeof sessionId !== 'string') {
            throw new Error('Session ID is not a string. Ensure RequestIdMiddleware is used before StartSessionMiddleware.');
        }

        await HttpEnvironment.getInstance().asyncSession.runWithSession(async () => {
            const currentSession = HttpEnvironment.getInstance().asyncSession.getSession();
            currentSession.id = sessionId;
        
            this.next();
        });
    }
}

export default AsyncSessionMiddleware; 
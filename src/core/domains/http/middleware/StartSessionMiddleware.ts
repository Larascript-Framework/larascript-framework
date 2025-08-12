import Middleware from '@src/core/domains/http/base/Middleware';
import HttpContext from '@src/core/domains/http/context/HttpContext';
import { asyncSession } from '@src/core/services/AsyncSession';

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
 * app.use(StartSessionMiddleware.create())
 */
class StartSessionMiddleware extends Middleware {

    /**
     * Executes the session middleware logic.
     * 
     * 1. Gets the request ID from the context to use as session ID
     * 2. Creates a new session context
     * 3. Sets the session ID
     * 4. Continues the middleware chain within the session context
     * 
     * @param context - The HTTP context containing request/response information
     */
    public async execute(context: HttpContext): Promise<void> {
        // Get request ID to use as session ID
        const sessionId = context.getId();

        if(typeof sessionId !== 'string') {
            throw new Error('Session ID is not a string. Ensure RequestIdMiddleware is used before StartSessionMiddleware.');
        }

        // Run the rest of the middleware chain within a session context
        await asyncSession().runWithSession(async () => {
            // Set the session ID
            const currentSession = asyncSession().getSession();
            currentSession.id = sessionId;
            
            // Continue middleware chain
            this.next();
        });
    }

}

export default StartSessionMiddleware; 
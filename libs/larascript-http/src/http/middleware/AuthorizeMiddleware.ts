import { HttpEnvironment } from '@/http/environment/HttpEnvironment.js';
import { IHttpContext, TBaseRequest } from '@larascript-framework/contracts/http';
import { UnauthorizedException } from '@larascript-framework/larascript-auth';
import { AbstractAuthMiddleware } from '../base/AbstractAuthMiddleware.js';
import { ForbiddenResourceError } from '../exceptions/ForbiddenResourceError.js';
import responseError from '../handlers/responseError.js';

/**
 * AuthorizeMiddleware handles authentication and authorization for HTTP requests
 * 

 * This middleware:
 * - Validates the authorization header and authenticates the request
 * - Attaches the authenticated user and API token to the request context
 * - Validates that the API token has the required scopes for the route
 * - Returns appropriate error responses for unauthorized/forbidden requests
 *
 * Key features:
 * - Request authentication via AuthRequest service
 * - Scope-based authorization
 * - Standardized error handling for auth failures
 * - Integration with request context for user/token storage
 *
 * Used as middleware on routes requiring authentication. Can be configured with
 * required scopes that are validated against the API token's allowed scopes.
 */
export class AuthorizeMiddleware extends AbstractAuthMiddleware<{ allowedScopes: string[] }> {

    /**
     * Executes the authorization middleware.
     * 
     * This method:
     * - Skips authorization for OPTIONS requests
     * - Attempts to authorize the request using the Bearer token
     * - Validates required scopes if specified
     * - Handles various authentication/authorization errors with appropriate HTTP status codes
     * 
     * @param context - The HTTP context containing request and response objects
     * @throws {UnauthorizedError} When authentication fails
     * @throws {ForbiddenResourceError} When authorization fails due to insufficient scopes
     */
    async execute(context: IHttpContext): Promise<void> {
        try {
            // Skip authorization check for OPTIONS requests
            if (context.getRequest().method === 'OPTIONS') {
                this.next();
                return;
            }

            // Attempt to authorize the request
            await this.attemptAuthorizeRequest(context.getRequest());

            // Validate the scopes of the request
            if (!await this.validateScopes(context)) {
                throw new ForbiddenResourceError();
            }

            this.next();
        }
        catch (error) {
            if (error instanceof UnauthorizedException) {
                responseError(context.getRequest(), context.getResponse(), error, 401)
            }
            else if (error instanceof ForbiddenResourceError) {
                responseError(context.getRequest(), context.getResponse(), error, 403)
            }
            else if (error instanceof Error) {
                responseError(context.getRequest(), context.getResponse(), error)
            }
        }
    }

    /**
     * Attempts to authorize a request with a Bearer token.
     * 
     * If successful, attaches the user and apiToken to the request. Sets the user in the App.
     * 
     * @param req The request to authorize
     * @returns The authorized request
     * @throws UnauthorizedError if the token is invalid
     */
    public async attemptAuthorizeRequest(req: TBaseRequest): Promise<TBaseRequest> {
        const authorization = (req.headers.authorization ?? '').replace('Bearer ', '');

        const apiToken = await HttpEnvironment.getInstance().authService.getJwt().attemptAuthenticateToken(authorization)

        if(!apiToken) {
            throw new UnauthorizedException();
        }

        const user = await HttpEnvironment.getInstance().authService.getUserRepository().findByIdOrFail(apiToken.getUserId())

        if (!user) {
            throw new UnauthorizedException();
        }

        // Set the user and apiToken in the request
        req.user = user;
        req.apiToken = apiToken

        // Set the user id in the request context
        HttpEnvironment.getInstance().authService.getJwt().authorizeUser(user)

        return req;
    }

    /**
     * Validates that the API token has all the required scopes for the request.
     * 
     * @param context - The HTTP context containing the request with the API token
     * @returns {Promise<boolean>} True if the token has all required scopes, false otherwise
     * @throws {ForbiddenResourceError} When the token lacks required scopes
     */
    async validateScopes(context: IHttpContext): Promise<boolean> {
        const scopes = this.config?.allowedScopes ?? [];
        const apiToken = context.getRequest().apiToken;

        if (!apiToken) {
            return false;
        }

        return apiToken.hasScope(scopes, true);
    }

}

export default AuthorizeMiddleware;
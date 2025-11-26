import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import { ApiResponse, HttpContext } from "@larascript-framework/larascript-http";
import { BaseUseCase } from "../base/BaseUseCase.js";

/**
 * LogoutUseCase handles user logout by revoking their JWT token
 * 
 * This class is responsible for:
 * - Validating the user has a valid API token
 * - Revoking/invalidating the JWT token via JwtAuthService
 * - Returning a successful empty response
 */
export class LogoutUseCase extends BaseUseCase {

    /**
     * Handle the user use case
     * @param context The HTTP context
     * @returns The API response
     */

    async handle(context: HttpContext): Promise<ApiResponse> {
        const apiToken = context.getApiToken();

        if(!apiToken) {
            throw new UnauthorizedException();
        }

        await this.environment.authService.getJwt().revokeToken(apiToken);

        return new ApiResponse().setCode(204)
    }

}


export default LogoutUseCase;



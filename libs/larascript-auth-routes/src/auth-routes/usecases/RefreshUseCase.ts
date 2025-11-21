import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import { ApiResponse, HttpContext } from "@larascript-framework/larascript-http";
import { BaseUseCase } from "../base/BaseUseCase.js";

/**
 * RefreshUseCase handles JWT token refresh requests
 * 
 * This class is responsible for:
 * - Validating the user has a valid existing API token
 * - Generating a new JWT token via JwtAuthService's refresh mechanism
 * - Returning the new token in the response
 * 
 */

class RefreshUseCase extends BaseUseCase {

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

        const refreshedToken = this.environment.authService.getJwt().refreshToken(apiToken);

        return new ApiResponse().setData({
            token: refreshedToken
        }).setCode(200)

    }

}


export default RefreshUseCase;



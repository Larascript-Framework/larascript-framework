import { auth } from "@/core/services/AuthService.js";
import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import {
  ApiResponse,
  HttpContext,
} from "@larascript-framework/larascript-http";

/**
 * LogoutUseCase handles user logout by revoking their JWT token
 *
 * This class is responsible for:
 * - Validating the user has a valid API token
 * - Revoking/invalidating the JWT token via JwtAuthService
 * - Returning a successful empty response
 */
class LogoutUseCase {
  /**
   * Handle the user use case
   * @param context The HTTP context
   * @returns The API response
   */

  async handle(context: HttpContext): Promise<ApiResponse> {
    const apiToken = context.getApiToken();

    if (!apiToken) {
      throw new UnauthorizedException();
    }

    await auth().getJwt().revokeToken(apiToken);

    return new ApiResponse().setCode(204);
  }
}

export default LogoutUseCase;

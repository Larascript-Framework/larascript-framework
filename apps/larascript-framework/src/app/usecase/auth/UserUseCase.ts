import { auth } from "@/core/services/AuthService.js";
import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import { IModel } from "@larascript-framework/larascript-database";
import { ApiResponse, HttpContext } from "@larascript-framework/larascript-http";

/**
 * UserUseCase handles retrieving the authenticated user's profile
 * 
 * This class is responsible for:
 * - Validating that the user is authenticated via their JWT token
 * - Retrieving the user's data from the user repository
 * - Returning the user's profile data, excluding guarded attributes
 * 
 */
class UserUseCase {

    /**
     * Handle the user use case
     * @param context The HTTP context
     * @returns The API response
     */

    async handle(context: HttpContext): Promise<ApiResponse> {
        const userId = context.getUser()?.getId();

        if(!userId) {
            throw new UnauthorizedException();
        }

        const user = await auth().getUserRepository().findById(userId);

        if(!user) {
            throw new UnauthorizedException();
        }

        const userAttributes = await (user as unknown as IModel).toObject({ excludeGuarded: true });

        return new ApiResponse().setData(userAttributes);
    }

}


export default UserUseCase;



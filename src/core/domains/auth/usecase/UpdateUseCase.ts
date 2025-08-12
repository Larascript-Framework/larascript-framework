
import { IValidatorResult, ValidatorResult } from "@ben-shepherd/larascript-validator";
import UnauthorizedError from "@src/core/domains/auth/exceptions/UnauthorizedError";
import { auth } from "@src/core/domains/auth/services/AuthService";
import HttpContext from "@src/core/domains/http/context/HttpContext";
import ApiResponse from "@src/core/domains/http/response/ApiResponse";

/**
 * UpdateUseCase handles user profile updates
 * 
 * This class is responsible for:
 * - Validating that the user is authenticated
 * - Validating the update data via configured validator
 * - Updating the user's profile information
 * - Saving changes to the user repository
 * - Returning the updated user data
 * 
 */
class UpdateUseCase {

    /**
     * Handle the user update use case
     * @param context The HTTP context
     * @returns The API response
     */

    async handle(context: HttpContext): Promise<ApiResponse> {
        const userId = context.getUser()?.getId();

        if(!userId) {
            throw new UnauthorizedError();
        }

        const validationResult = await this.validate(context);

        if(validationResult.fails()) {
            return new ApiResponse().setCode(422).setData({
                errors: validationResult.errors()
            })
        }

        const user = await auth().getJwtAdapter().getUserRepository().findByIdOrFail(userId);

        // Update the user and save
        user.fill(context.getBody());
        await user.save();


        // Get the user attributes
        const userAttributes = await user.toObject({ excludeGuarded: true})

        return new ApiResponse().setData({
            user: userAttributes
        }).setCode(200)
    }

    /**
     * Validate the request body
     * @param context The HTTP context
     * @returns The validation result
     */
    async validate(context: HttpContext): Promise<IValidatorResult<any>> {
        const validatorConstructor = auth().getJwtAdapter().config?.validators?.updateUser

        if(!validatorConstructor) {
            return ValidatorResult.passes();
        }

        const validator = new validatorConstructor();
        return await validator.validate(context.getBody());
    }

}


export default UpdateUseCase;



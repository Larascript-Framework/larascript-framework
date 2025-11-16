import UpdateUserValidator from "@/app/validators/user/UpdateUserValidator.js";
import { auth } from "@/core/services/AuthService.js";
import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import { IModel } from "@larascript-framework/larascript-database";
import { ApiResponse, HttpContext } from "@larascript-framework/larascript-http";
import { IValidatorResult, ValidatorResult } from "@larascript-framework/larascript-validator";

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
            throw new UnauthorizedException();
        }

        const validationResult = await this.validate(context);

        if(validationResult.fails()) {
            return new ApiResponse().setCode(422).setData({
                errors: validationResult.errors()
            })
        }

        const user = await auth().getUserRepository().findByIdOrFail(userId);

        // Update the user and save
        await (user as unknown as IModel).fill(context.getBody());
        await (user as unknown as IModel).save();


        // Get the user attributes
        const userAttributes = await (user as unknown as IModel).toObject({ excludeGuarded: true})

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
        // TODO: this should be provided abstractly
        const validatorConstructor = UpdateUserValidator;

        if(!validatorConstructor) {
            return ValidatorResult.passes();
        }

        const validator = new validatorConstructor();
        return await validator.validate(context.getBody());
    }

}


export default UpdateUseCase;



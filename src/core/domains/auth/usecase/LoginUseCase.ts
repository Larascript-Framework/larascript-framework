
import { minExecTime } from "@ben-shepherd/larascript-utils";
import UnauthorizedError from "@src/core/domains/auth/exceptions/UnauthorizedError";
import { IUserModel } from "@src/core/domains/auth/interfaces/models/IUserModel";
import { authJwt } from "@src/core/domains/auth/services/JwtAuthService";
import HttpContext from "@src/core/domains/http/context/HttpContext";
import ApiResponse from "@src/core/domains/http/response/ApiResponse";

export type LoginUseCaseResponse = ApiResponse<{
    token: string;
    user: IUserModel['attributes']
} | {
    message: string
}>

/**
 * LoginUseCase handles user authentication by validating credentials and generating JWT tokens
 * 
 * This class is responsible for:
 * - Validating user email and password credentials
 * - Generating JWT tokens for authenticated users
 * - Returning user data and token on successful login
 * - Handling authentication errors and unauthorized access
 * 
 * The handle() method processes the login request by:
 * 1. Extracting credentials from the request body
 * 2. Looking up the user by email
 * 3. Verifying the password hash matches
 * 4. Generating a JWT token via JwtAuthService
 * 5. Returning the token and user data in the response
 */
class LoginUseCase {

    /**
     * Handle the login use case

     * @param context The HTTP context
     * @returns The API response
     */
    async handle(context: HttpContext): Promise<LoginUseCaseResponse> {
        return minExecTime<LoginUseCaseResponse>(500, async () => {
            const apiResponse = new ApiResponse();

            const { email = '', password = '' } = context.getBody();

            const user = await authJwt().getUserRepository().findByEmail(email);

            if (!user) {
                return this.unauthorized('Email or password is incorrect') as LoginUseCaseResponse;
            }

            let jwtToken!: string;

            try {
                jwtToken = await authJwt().attemptCredentials(email, password);
            }

            catch (error) {
                if (error instanceof UnauthorizedError) {
                    return this.unauthorized('Email or password is incorrect') as LoginUseCaseResponse;
                }
                throw error;
            }

            const userAttributes = await user.toObject({ excludeGuarded: true });

            return apiResponse.setData({
                token: jwtToken,
                user: userAttributes
            }).setCode(200) as LoginUseCaseResponse; 
        })
    }

    /**
     * Unauthorized response
     * @param message The message
     * @returns The API response
     */
    unauthorized(message = 'Unauthorized') {
        return new ApiResponse().setCode(401).setData({
            message
        });
    }


}


export default LoginUseCase;
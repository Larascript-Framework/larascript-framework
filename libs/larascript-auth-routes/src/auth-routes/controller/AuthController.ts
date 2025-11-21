import LoginUseCase from "@/auth-routes/usecases/LoginUseCase.js";
import LogoutUseCase from "@/auth-routes/usecases/LogoutUseCase.js";
import RefreshUseCase from "@/auth-routes/usecases/RefreshUseCase.js";
import RegisterUseCase from "@/auth-routes/usecases/RegisterUseCase.js";
import UpdateUseCase from "@/auth-routes/usecases/UpdateUseCase.js";
import UserUseCase from "@/auth-routes/usecases/UserUseCase.js";
import { UnauthorizedException } from "@larascript-framework/larascript-auth";
import { ApiResponse, Controller, ForbiddenResourceError, HttpContext, responseError } from "@larascript-framework/larascript-http";
import { ValidatorException } from "@larascript-framework/larascript-validator";

/**
 * Controller handling authentication-related HTTP endpoints.
 * 
 * This controller manages user authentication operations including:
 * - User registration
 * - Login/authentication
 * - User profile retrieval
 * - Logout
 * - Token refresh
 * 
 * Each method handles its respective HTTP endpoint and delegates the business logic
 * to appropriate use cases while handling response formatting and error cases.
 */
export class AuthController extends Controller {

    protected loginUseCase = new LoginUseCase();
    
    protected registerUseCase = new RegisterUseCase();

    protected userUseCase = new UserUseCase();
    
    protected logoutUseCase = new LogoutUseCase();

    protected refreshUseCase = new RefreshUseCase();

    protected updateUseCase = new UpdateUseCase();

    /**
     * Handle the login endpoint

     * @param context The HTTP context
     * @returns The API response
     */
    async login(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.loginUseCase.handle(context)
        })
    }


    /**
     * Handle the register endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async register(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.registerUseCase.handle(context)
        })
    }

    /**
     * Handle the user endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async user(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.userUseCase.handle(context)
        })
    }


    /**
     * Handle the logout endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async logout(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.logoutUseCase.handle(context)
        })
    }

    /**
     * Handle the refresh endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async refresh(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.refreshUseCase.handle(context)
        })
    }

    /**
     * Handle the update endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async update(context: HttpContext) {
        await this.handler(context, async () => {
            return await this.updateUseCase.handle(context)
        })
    }

    /**
     * Handle the request
     * @param context The HTTP context
     * @param callback The callback to handle the request
     * @returns The API response

     */
    protected async handler(context: HttpContext, callback: () => Promise<ApiResponse>) {
        try {
            const apiResponse = await callback();

            return this.jsonResponse(
                apiResponse.toResponseObject(),
                apiResponse.getCode()
            )
        }
        catch (error) {
            if(error instanceof UnauthorizedException) {
                responseError(context.getRequest(), context.getResponse(), error as Error, 401)
                return;
            }

            if(error instanceof ValidatorException) {
                responseError(context.getRequest(), context.getResponse(), error as Error, 422)
                return;
            }

            if(error instanceof ForbiddenResourceError) {
                responseError(context.getRequest(), context.getResponse(), error as Error, 403)
                return;
            }

            responseError(context.getRequest(), context.getResponse(), error as Error)
        }

    }

}

export default AuthController;

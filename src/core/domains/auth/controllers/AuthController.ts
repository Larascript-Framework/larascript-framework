import { ValidatorException } from "@ben-shepherd/larascript-validator";
import ForbiddenResourceError from "@src/core/domains/auth/exceptions/ForbiddenResourceError";
import UnauthorizedError from "@src/core/domains/auth/exceptions/UnauthorizedError";
import LoginUseCase from "@src/core/domains/auth/usecase/LoginUseCase";
import LogoutUseCase from "@src/core/domains/auth/usecase/LogoutUseCase";
import RefreshUseCase from "@src/core/domains/auth/usecase/RefreshUseCase";
import RegisterUseCase from "@src/core/domains/auth/usecase/RegisterUseCase";
import UpdateUseCase from "@src/core/domains/auth/usecase/UpdateUseCase";
import UserUseCase from "@src/core/domains/auth/usecase/UserUseCase";
import Controller from "@src/core/domains/http/base/Controller";
import HttpContext from "@src/core/domains/http/context/HttpContext";
import responseError from "@src/core/domains/http/handlers/responseError";
import ApiResponse from "@src/core/domains/http/response/ApiResponse";

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
class AuthController extends Controller {

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
        this.handler(context, async () => {
            return await this.loginUseCase.handle(context)
        })
    }


    /**
     * Handle the register endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async register(context: HttpContext) {
        this.handler(context, async () => {
            return await this.registerUseCase.handle(context)
        })
    }

    /**
     * Handle the user endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async user(context: HttpContext) {
        this.handler(context, async () => {
            return await this.userUseCase.handle(context)
        })
    }


    /**
     * Handle the logout endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async logout(context: HttpContext) {
        this.handler(context, async () => {
            return await this.logoutUseCase.handle(context)
        })
    }

    /**
     * Handle the refresh endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async refresh(context: HttpContext) {
        this.handler(context, async () => {
            return await this.refreshUseCase.handle(context)
        })
    }

    /**
     * Handle the update endpoint
     * @param context The HTTP context
     * @returns The API response
     */
    async update(context: HttpContext) {
        this.handler(context, async () => {
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
            if(error instanceof UnauthorizedError) {
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

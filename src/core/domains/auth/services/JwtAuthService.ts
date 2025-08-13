import BaseAuthAdapter from "@src/core/domains/auth/base/BaseAuthAdapter";
import AuthController from "@src/core/domains/auth/controllers/AuthController";
import InvalidSecretException from "@src/core/domains/auth/exceptions/InvalidJwtSettings";
import UnauthorizedError from "@src/core/domains/auth/exceptions/UnauthorizedError";
import JwtFactory from "@src/core/domains/auth/factory/JwtFactory";
import { IAclConfig } from "@src/core/domains/auth/interfaces/acl/IAclConfig";
import { IJwtAuthService } from "@src/core/domains/auth/interfaces/jwt/IJwtAuthService";
import { IJwtConfig } from "@src/core/domains/auth/interfaces/jwt/IJwtConfig";
import { ApiTokenModelOptions, IApiTokenModel } from "@src/core/domains/auth/interfaces/models/IApiTokenModel";
import { IUserModel } from "@src/core/domains/auth/interfaces/models/IUserModel";
import { IApiTokenRepository } from "@src/core/domains/auth/interfaces/repository/IApiTokenRepository";
import { IUserRepository } from "@src/core/domains/auth/interfaces/repository/IUserRepository";
import { IOneTimeAuthenticationService } from "@src/core/domains/auth/interfaces/service/oneTimeService";
import AuthorizeMiddleware from "@src/core/domains/auth/middleware/AuthorizeMiddleware";
import ApiToken from "@src/core/domains/auth/models/ApiToken";
import ApiTokenRepository from "@src/core/domains/auth/repository/ApiTokenRepitory";
import UserRepository from "@src/core/domains/auth/repository/UserRepository";
import OneTimeAuthenticationService from "@src/core/domains/auth/services/OneTimeAuthenticationService";
import createJwt from "@src/core/domains/auth/utils/createJwt";
import decodeJwt from "@src/core/domains/auth/utils/decodeJwt";
import generateToken from "@src/core/domains/auth/utils/generateToken";
import { IRouter } from "@src/core/domains/http/interfaces/IRouter";
import Route from "@src/core/domains/http/router/Route";
import Router from "@src/core/domains/http/router/Router";
import { app } from "@src/core/services/App";
import { cryptoService } from "@src/core/services/CryptoService";
import { JsonWebTokenError } from "jsonwebtoken";
import { DataTypes } from "sequelize";

/**
 * Short hand for app('auth.jwt')
 */
export const authJwt = () => app('auth.jwt')

/**
 * JwtAuthService is an authentication adapter that implements JWT (JSON Web Token) based authentication.
 * It extends BaseAuthAdapter and provides JWT-specific authentication functionality.
 * 
 * This service:
 * - Handles JWT token creation and validation
 * - Manages user authentication via email/password credentials
 * - Provides API token management for machine-to-machine auth
 * - Configures auth-related routes and middleware
 * - Integrates with the application's ACL (Access Control List) system
 * 
 * The service can be accessed via the 'auth.jwt' helper:
 * ```ts
 * const jwtAuth = authJwt();
 * const token = await jwtAuth.attemptCredentials(email, password);
 * ```
 */
class JwtAuthService extends BaseAuthAdapter<IJwtConfig> implements IJwtAuthService {

    private apiTokenRepository!: IApiTokenRepository

    private userRepository!: IUserRepository

    protected _oneTimeService = new OneTimeAuthenticationService()

    constructor(config: IJwtConfig, aclConfig: IAclConfig) {
        super(config, aclConfig);
        this.apiTokenRepository = new ApiTokenRepository(config.models?.apiToken)
        this.userRepository = new UserRepository(config.models?.user)
    }

    public oneTimeService(): IOneTimeAuthenticationService {
        return this._oneTimeService
    }

    /**
     * Get the JWT secret
     * 
     * @returns 
     */
    private getJwtSecret(): string {
        if (!this.config.settings.secret) {
            throw new InvalidSecretException()
        }
        return this.config.settings.secret
    }

    /**
     * Get the JWT expires in minutes
     * 
     * @returns 
     */

    private getJwtExpiresInMinutes(): number {
        if (!this.config.settings.expiresInMinutes) {
            throw new InvalidSecretException()
        }
        return this.config.settings.expiresInMinutes
    }

    /**
     * Attempt login with credentials
     * @param email 
     * @param password 
     * @returns 
     */
    async attemptCredentials(email: string, password: string, scopes: string[] = [], options?: ApiTokenModelOptions): Promise<string> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedError()
        }

        const hashedPassword = user.getAttributeSync('hashedPassword') as string | null

        if (!hashedPassword) {
            throw new UnauthorizedError()
        }

        if (!cryptoService().verifyHash(password, hashedPassword)) {
            throw new UnauthorizedError()
        }

        // Generate the api token
        const apiToken = await this.buildApiTokenByUser(user, scopes, options ?? {})

        if (typeof options?.expiresAfterMinutes === 'number') {
            const expiresAt = new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000)
            await apiToken.setAttribute(ApiToken.EXPIRES_AT, expiresAt)
        }

        // Save
        await apiToken.save()

        // Generate the JWT token
        return this.generateJwt(apiToken)
    }

    /**
     * Create a new ApiToken model from the User
     * @param user 
     * @returns 
     */
    protected async buildApiTokenByUser(user: IUserModel, scopes: string[] = [], options: ApiTokenModelOptions = {}): Promise<IApiTokenModel> {
        const apiToken = ApiToken.create<IApiTokenModel>()
        await apiToken.setUserId(user.id as string)
        await apiToken.setToken(generateToken())
        await apiToken.setScopes([...app('acl.basic').getRoleScopesFromUser(user), ...scopes])
        await apiToken.setRevokedAt(null)
        await apiToken.setAttribute(ApiToken.OPTIONS, options)

        if (options?.expiresAfterMinutes) {
            const expiresAt = new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000)
            await apiToken.setAttribute(ApiToken.EXPIRES_AT, expiresAt)
        }

        return apiToken
    }

    /**
     * Generate a JWT token
     * @param apiToken 
     * @returns 
     */
    protected generateJwt(apiToken: IApiTokenModel) {
        if (!apiToken?.userId) {
            throw new Error('Invalid token');
        }

        // Create the payload
        const payload = JwtFactory.createUserIdAndPayload(apiToken.getUserId(), apiToken.getToken());

        // Get the expires in minutes. Example: 1m
        const expiresIn = `${this.getJwtExpiresInMinutes()}m`

        // Create the JWT token
        return createJwt(this.getJwtSecret(), payload, expiresIn)
    }

    /**
     * Attempt authentication against a JWT

     * @param token 
     * @returns 
     */
    async attemptAuthenticateToken(token: string): Promise<IApiTokenModel | null> {
        try {
            const { token: decodedToken, uid: decodedUserId } = decodeJwt(this.getJwtSecret(), token);

            const apiToken = await this.apiTokenRepository.findOneActiveToken(decodedToken)

            if (!apiToken) {
                throw new UnauthorizedError()
            }

            const user = await this.userRepository.findById(decodedUserId)

            if (!user) {
                throw new UnauthorizedError()
            }

            if (apiToken.hasExpired()) {
                throw new UnauthorizedError()
            }

            return apiToken
        }
        catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw new UnauthorizedError()
            }
        }

        return null
    }

    /**
     * Create a JWT token from a user
     * @param user 
     * @returns 
     */
    public async createJwtFromUser(user: IUserModel, scopes: string[] = [], options: ApiTokenModelOptions = {}): Promise<string> {
        const apiToken = await this.buildApiTokenByUser(user, scopes, options)
        await apiToken.save()
        return this.generateJwt(apiToken)
    }

    /**
     * Refresh a token
     * @param apiToken 
     * @returns 
     */

    refreshToken(apiToken: IApiTokenModel): string {
        return this.generateJwt(apiToken)
    }

    /**
     * Revokes a token
     * @param apiToken 
     * @returns 
     */

    async revokeToken(apiToken: IApiTokenModel): Promise<void> {
        if (apiToken?.revokedAt) {
            return;
        }

        await this.apiTokenRepository.revokeToken(apiToken)
    }

    /**
     * Revokes all tokens for a user
     * @param userId 
     * @returns 
     */
    async revokeAllTokens(userId: string | number): Promise<void> {
        await this.apiTokenRepository.revokeAllTokens(userId)
    }

    /**
     * Get the router
     * @returns 
     */
    getRouter(): IRouter {
        if (!this.config.routes.enabled) {
            return new Router();
        }

        return Route.group({
            prefix: '/auth',
            controller: AuthController,
            config: {
                adapter: 'jwt'
            }
        }, (router) => {


            if (this.config.routes.endpoints.login) {
                router.post('/login', 'login');
            }

            if (this.config.routes.endpoints.register) {
                router.post('/register', 'register');
            }

            router.group({
                middlewares: [AuthorizeMiddleware]
            }, (router) => {

                if (this.config.routes.endpoints.login) {
                    router.get('/user', 'user');
                }

                if (this.config.routes.endpoints.update) {
                    router.patch('/update', 'update');
                }

                if (this.config.routes.endpoints.refresh) {
                    router.post('/refresh', 'refresh');
                }

                if (this.config.routes.endpoints.logout) {
                    router.post('/logout', 'logout');
                }

            })

        })
    }

    /**
     * Get the user repository
     * @returns The user repository
     */
    public getUserRepository(): IUserRepository {
        return new UserRepository(this.config.models?.user);
    }

    /**
     * Get the create user table schema
     * @returns 
     */
    public getCreateUserTableSchema() {
        return {
            email: DataTypes.STRING,
            hashedPassword: DataTypes.STRING,
            groups: DataTypes.ARRAY(DataTypes.STRING),
            roles: DataTypes.ARRAY(DataTypes.STRING),
        }
    }

    /**
     * Get the create api token table schema
     * @returns 
     */
    public getCreateApiTokenTableSchema() {
        return {
            userId: DataTypes.STRING,
            token: DataTypes.STRING,
            scopes: DataTypes.JSON,
            revokedAt: DataTypes.DATE
        }
    }

    /**
     * Get the user
     * @returns The user
     */
    async user(): Promise<IUserModel | null> {
        if (!await this.check()) {
            return null
        }

        return await this.userRepository.findById(
            app('asyncSession').getSessionData().userId as string
        )
    }

}


export default JwtAuthService;

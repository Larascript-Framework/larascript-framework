import { IAuthRoutesConfig, IAuthRoutesValidatorsConfig } from "@larascript-framework/contracts/auth";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import { AuthorizeMiddleware, HttpRouter, IRouter } from "@larascript-framework/larascript-http";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import AuthController from "../controller/AuthController.js";

/**
 * Service for managing authentication routes.
 * Extends the BaseSingleton with IHttpAuthRoutesConfig.
 */
export class AuthRoutesService extends BaseSingleton<IAuthRoutesConfig & IAuthRoutesValidatorsConfig> {

    /**
     * Constructs the AuthRoutesService with the given configuration.
     * @param {IAuthRoutesConfig} config - The configuration for the authentication routes.
     * @throws Will throw an error if the config is not provided.
     */
    constructor(config: IAuthRoutesConfig) {
        super(config);

        if (!config) {
            throw new Error("AuthRoutesService config is required");
        }
    }

    /**
     * Creates an instance of AuthRoutesService with the given configuration.
     * @param {IAuthRoutesConfig} config - The configuration for the authentication routes.
     * @returns {AuthRoutesService} The instance of AuthRoutesService.
     */
    static create(config: IAuthRoutesConfig) {
        AuthRoutesService.getInstance(config).config = config;
        return AuthRoutesService.getInstance();
    }

    /**
     * Retrieves the configuration for the authentication routes.
     * @returns {IAuthRoutesConfig} The configuration object.
     * @throws Will throw an error if the service has not been created.
     */
    getConfig(): IAuthRoutesConfig {
        if(!this.config) {
            throw new Error('AuthRoutesService has not been created');
        }
        return this.config;
    }

    /**
     * Retrieves the authentication controller class constructor.
     * @returns {TClassConstructor<AuthController>} The class constructor for AuthController.
     */
    getAuthController(): TClassConstructor<AuthController> {
        return AuthController;
    }

    /**
     * Retrieves the router for authentication routes.
     * @returns {IRouter} The router configured with authentication routes.
     */
    getRouter(): IRouter { 
        const config = this.getConfig()!;

        if (!config.routes.enabled) {
            return new HttpRouter();
        }

        return new HttpRouter().group(router => {
            return router.group({
                prefix: '/auth',
                controller: AuthController,
                config: {
                    adapter: 'jwt'
                }
            }, (router) => {

                if (config.routes.endpoints.login) {
                    router.post('/login', 'login');
                }

                if (config.routes.endpoints.register) {
                    router.post('/register', 'register');
                }

                router.group({
                    middlewares: [AuthorizeMiddleware]
                }, (router) => {

                    if (config.routes.endpoints.login) {
                        router.get('/user', 'user');
                    }

                    if (config.routes.endpoints.update) {
                        router.patch('/update', 'update');
                    }

                    if (config.routes.endpoints.refresh) {
                        router.post('/refresh', 'refresh');
                    }

                    if (config.routes.endpoints.logout) {
                        router.post('/logout', 'logout');
                    }

                })

            })

        })
    }
}
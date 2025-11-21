import { IHttpService, IHttpServiceConfig, IRoute, IRouter, MiddlewareConstructor, TExpressMiddlewareFn, TExpressMiddlewareFnOrClass, TRouteItem } from '@larascript-framework/contracts/http';
import { BaseService } from '@larascript-framework/larascript-core';
import expressClient from 'express';
import http from 'http';
import Middleware from '../base/Middleware.js';
import { baseConfig } from '../config/base.config.js';
import { baseErrorHandler } from '../handlers/baseErrorHandler.js';
import { baseNotFoundHandler } from '../handlers/baseNotFoundHandler.js';
import AsyncSessionMiddleware from '../middleware/AsyncSessionMiddleware.js';
import EndRequestContextMiddleware from '../middleware/EndRequestContextMiddleware.js';
import RequestIdMiddleware from '../middleware/RequestIdMiddleware.js';
import Route from '../router/Route.js';
import RouterBindService from '../router/RouterBindService.js';

/**
 * TODO: 
 * - add useErrorHandlers method
 * - refactor errorHandlers into base methods
 * - add config options so user can expand on errorHandlers
 */

/**
 * ExpressService class
 * Responsible for initializing and configuring ExpressJS
 * @implements IHttpService
 */
export class HttpService extends BaseService<IHttpServiceConfig> implements IHttpService {

    declare config: IHttpServiceConfig | null;

    private readonly app: expressClient.Express

    private server: http.Server | null = null

    private routerBindService!: RouterBindService;

    protected registeredRoutes: TRouteItem[] = []

    private routers: IRouter[] = []

    /**
     * Config defined in @/config/http/express.ts
     * @param config 
     */
    constructor(config: Partial<IHttpServiceConfig> | null = null) {
        super(config as IHttpServiceConfig)
        this.config = this.getConfigWithDefaults(config)
        this.app = expressClient()
        this.setupRouterBindService()
    }

    /**
     * Sets up the RouterBindService
     */
    private setupRouterBindService() {
        const beforeAllMiddlewares = [
            RequestIdMiddleware.create(),
            AsyncSessionMiddleware.create(),
            EndRequestContextMiddleware.create(),
            ...(this.config?.beforeAllMiddlewares ?? []),
        ] as (expressClient.RequestHandler | TExpressMiddlewareFnOrClass)[]

        const afterAllMiddlewares = [
            ...(this.config?.afterAllMiddlewares ?? []),
        ]

        this.routerBindService = new RouterBindService()
        this.routerBindService.setExpress(this.app, this.config)
        this.routerBindService.setOptions({ beforeAllMiddlewares, afterAllMiddlewares })
    }

    /**
     * Initializes the HttpService
     */
    public init() {
        if (!this.config) {
            throw new Error('Config not provided');
        }

        // Execute the extendExpress config option
        this.extendExpress()        
    }

    /**
     * Boots the HttpService
     */
    async boot(): Promise<void> {
        this.applyUseRouters()
        this.useErrorHandlers()

        await this.listen()
    }

    /**
     * Starts listening for connections on the port specified in the config.
     * If no port is specified, the service will not start listening.
     */
    public async listen(): Promise<void> {
        const port = this.config?.port

        return new Promise(resolve => {
            this.server = this.app.listen(port, () => resolve())
        })
    }

    /**
     * Returns the config with the defaults
     * @param config - The config
     * @returns The config with the defaults
     */
    public getConfigWithDefaults(config: Partial<IHttpServiceConfig> | null = null): IHttpServiceConfig {
        return {
            ...baseConfig,
            beforeAllMiddlewares: [
                ...(baseConfig.beforeAllMiddlewares ?? []),
                ...(this.config?.beforeAllMiddlewares ?? []),
            ],
            afterAllMiddlewares: [
                ...(baseConfig.afterAllMiddlewares ?? []),
                ...(this.config?.afterAllMiddlewares ?? []),
            ],
            ...(config ?? {}),
        }
    }

    /**
     * Execute the extendExpress config option
     */
    protected extendExpress() {
        if(typeof this.config?.extendExpress === 'function') {
            baseConfig?.extendExpress?.(this.app)
            this.config.extendExpress(this.app)
        }
    }

    /**
     * Returns the route instance.
     */
    public route(): IRoute {
        return new Route();
    }

    /**
     * Returns the registered routes.
     */
    public getRegisteredRoutes(): TRouteItem[] {
        return this.registeredRoutes
    }


    /**
     * Adds a middleware to the Express instance.
     * @param middleware - The middleware to add
     */
    public useMiddleware(middleware: TExpressMiddlewareFn | MiddlewareConstructor) {
        if (middleware.prototype instanceof Middleware) {
            this.app.use((middleware as MiddlewareConstructor).create())
        }
        else {
            this.app.use(middleware as TExpressMiddlewareFn)
        }
    }



    /**
     * Binds the routes to the Express instance.
     * @param router - The router to bind
     */
    public useRouterAndApply(router: IRouter): void {
        this.useRouter(router)
        this.applySingleRouter(router)
    }
    
    /**
     * Adds a router to the HttpService.
     * @param router - The router to add
     */
    public useRouter(router: IRouter): void {
        if (router.empty()) {
            return
        }
        this.routers.push(router)
    }

    /**
     * Applies the routers to the Express instance.
     */
    public applyUseRouters() {
        for(const router of this.routers) {
            this.applySingleRouter(router)
        }
    }

    /**
     * Applies a single router to the Express instance.
     * @param router - The router to apply
     */
    protected applySingleRouter(router: IRouter) {
        this.routerBindService.bindRoutes(router)
        this.registeredRoutes.push(...router.getRegisteredRoutes())
    }

    /**
     * Applies the error handlers to the Express instance.
     */
    protected useErrorHandlers() {
        if(!this.config) {
            throw new Error('Config not provided')
        }

        if(this.config.disableErrorHandlers) {
            return
        }

        // Note: This is a catch-all handler for errors. Typically, these will also be handled manually in the RouterBindService. (See wrapHttpContext method)
        const errorHandler = baseErrorHandler(this.config)

        // Note: The 404 handler should always be added last, otherwise normal routes will return a 404.
        const notFoundHandler = baseNotFoundHandler(this.config)

        this.app.use(errorHandler)
        this.app.use(notFoundHandler)
    }

    /**
     * Returns the Express instance.
     */
    public getExpress(): expressClient.Express {
        return this.app
    }

    /**
     * Checks if Express is enabled.
     * @returns true if enabled, false otherwise.
     */
    public isEnabled(): boolean {
        return this.config?.enabled ?? false
    }

    /**
     * Returns the server.
     * @returns the server.
     */
    public getServer(): http.Server | null {
        return this.server
    }

    /**
     * Returns the port the server is listening on.
     * @returns the port number or null if server is not listening.
     */
    public getPort(): number | null {
        if (!this.server) {
            return null;
        }
        const address = this.server.address();
        if (typeof address === 'object' && address !== null) {
            return address.port;
        }
        return null;
    }

    /**
     * Closes the server.
     */
    public close(): void {
        this.server?.close()
    }

}

export default HttpService;
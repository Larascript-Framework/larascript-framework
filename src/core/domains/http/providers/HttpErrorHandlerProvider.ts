import { AppSingleton, BaseProvider } from '@ben-shepherd/larascript-core';
import httpConfig from '@src/config/http.config';
import IHttpConfig from '@src/core/domains/http/interfaces/IHttpConfig';
import errorHandler from '@src/core/domains/http/middleware/errorHandler';
import { app } from "@src/core/services/App";


export default class HttpErrorHandlerProvider extends BaseProvider {

    /**
     * The configuration for the Express provider
     *
     * @default httpConfig
     */
    protected config: IHttpConfig = httpConfig;

    /**
     * Register method
     * Called when the provider is being registered
     * Use this method to set up any initial configurations or services
     *
     * @returns Promise<void>
     */
    public async register(): Promise<void> {
        this.log('Registering HttpErrorHandlerProvider');

        // Check if the routes provider has been registered
        if (!AppSingleton.safeContainer('routes.provided')) {
            throw new Error('HttpErrorHandlerProvider must be registered after RoutesProvider');
        }
    }

    /**
     * Boot the Express provider
     *
     * @returns Promise<void>
     */
    public async boot(): Promise<void> {

        /**
         * If Express is not enabled, return from the boot method
         */
        if (!this.config.enabled) {
            return;
        }

        /**
         * Get the Express instance from the container
         * Initialize Express
         */
        const http = app('http');

        // Handle errors
        http.getExpress().use(errorHandler.notFoundHandler);
        http.getExpress().use(errorHandler.errorHandler);

    }

}
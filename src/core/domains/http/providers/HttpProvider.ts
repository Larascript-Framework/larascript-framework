import { BaseProvider } from '@ben-shepherd/larascript-core';
import httpConfig from '@src/config/http.config';
import RequestContext from '@src/core/domains/http/context/RequestContext';
import RequestContextCleaner from '@src/core/domains/http/context/RequestContextCleaner';
import IHttpConfig from '@src/core/domains/http/interfaces/IHttpConfig';
import HttpService from '@src/core/domains/http/services/HttpService';
import { app } from "@src/core/services/App";
import expressLayouts from 'express-ejs-layouts';

export default class HttpProvider extends BaseProvider {

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
        this.log('Registering HttpProvider');


        // Register the Express service in the container
        // This will be available in any provider or service as App.container('express')
        this.bind('http', new HttpService(this.config));


        // Register the RequestContext service in the container
        // This will be available in any provider or service as App.container('requestContext')
        // The RequestContext class can be used to store data over a request's life cycle
        // Additionally, data can be stored which can be linked to the requests IP Address with a TTL
        this.bind('requestContext', new RequestContext());
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

        this.log('Booting HttpProvider');

        /**
         * Get the Express instance from the container
         * Initialize Express
         */
        const http = app('http');
        http.init();

        /**
         * Setup view engine, views, layouts directories
         */
        http.getExpress().set('view engine', 'ejs')
        http.getExpress().set('views', require('path').join(process.cwd(), 'src', 'app', 'resources', 'views'))
        http.getExpress().use(expressLayouts);
        http.getExpress().set('layout', require('path').join(process.cwd(), 'src', 'app', 'resources', 'layouts', 'base-view.ejs'));

        /**
         * Start listening for connections
         */
        await http.listen();

        /**
         * Start the RequestContextCleaner
         */
        RequestContextCleaner.boot({
            delayInSeconds: this.config.currentRequestCleanupDelay ?? 30
        })

        // Log that Express is successfully listening
        this.log('Express successfully listening on port ' + http.getConfig()?.port);
    }


}
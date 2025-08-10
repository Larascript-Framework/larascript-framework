import { parseBooleanFromString } from '@ben-shepherd/larascript-utils-bundle';
import IHttpConfig from '@src/core/domains/http/interfaces/IHttpConfig';
import BasicLoggerMiddleware from '@src/core/domains/http/middleware/BasicLoggerMiddleware';
import SecurityMiddleware from '@src/core/domains/http/middleware/SecurityMiddleware';
import ValidatorMiddleware from '@src/core/domains/validator/middleware/ValidatorMiddleware';
import cors from 'cors';
import expressBusboy from 'express-busboy';
import path from 'path';

const config: IHttpConfig = {

    /**
     * Enable Express
     */
    enabled: parseBooleanFromString(process.env.ENABLE_EXPRESS, 'true'),

    /**
     * HTTP port
     */
    port: parseInt(process.env.APP_PORT ?? '5000'),

    /**
     * Global middleware to run before every other middleware
     */
    beforeAllMiddlewares: [

        /**
         * Larascript required middlewares
         */
        cors(),
        BasicLoggerMiddleware,
        SecurityMiddleware,
        // CsrfMiddleware,

        /**
         * Add your custom middlewares below
         */
    ],

    /**
     * Global middleware to run after every other middleware
     */
    afterAllMiddlewares: [
        ValidatorMiddleware,
    ],

    /**
     * Extend the express app
     */
    extendExpress: (app) => {
        expressBusboy.extend(app, {
            upload: true,
            path: path.join(__dirname, '../../storage/tmp'),
            allowedPath: /./
        })
    },

    /**
     * CSRF protection
     */
    csrf: {
        methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
        headerName: 'x-xsrf-token',
        ttl: 24 * 60 * 60,

        /**
         * Exclude routes from CSRF protection
         * You may use '*' to exclude all routes e.g. '/auth/*'
         */
        exclude: [
            // Exclude all routes
            // '/*',

            // Exclude specific routes
            '/auth/login',
            '/auth/register',
            '/auth/logout',
            '/auth/refresh',
        ]
    },

    /**
     * Logging
     */
    logging: {
        requests: parseBooleanFromString(process.env.ENABLE_REQUEST_LOGGING, 'true'),
        boundRouteDetails: parseBooleanFromString(process.env.ENABLE_BOUND_ROUTE_DETAILS, 'true')
    }

};

export default config
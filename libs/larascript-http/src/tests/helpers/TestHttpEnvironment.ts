import { HTTP_ENVIRONMENT_DEFAULTS } from "@/http/config/environment.config.js";
import { testConfig } from "@/http/config/test.config.js";
import { HttpEnvironment } from "@/http/environment/index.js";
import CsrfMiddleware from "@/http/middleware/CsrfMiddlware.js";
import HttpService from "@/http/services/HttpService.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IHttpEnvironmentConfig, IHttpServiceConfig } from "@larascript-framework/contracts/http";
import { aclConfig, authConfig, AuthEnvironment, IAuthEnvironmentConfig, routesConfig } from "@larascript-framework/larascript-auth";
import { BaseSingleton, EnvironmentTesting } from "@larascript-framework/larascript-core";
import { DatabaseEnvironment } from "@larascript-framework/larascript-database";
import { ValidatorServices } from "@larascript-framework/larascript-validator";

export const TEST_HTTP_ENVIRONMENT_DEFAULTS: IHttpEnvironmentConfig = {
    ...HTTP_ENVIRONMENT_DEFAULTS,
    databaseConfigured: true,
    authConfigured: true,
};

export class TestHttpEnvironment extends BaseSingleton<IHttpEnvironmentConfig> {

    protected httpServiceConfig: IHttpServiceConfig = testConfig;

    static create(config: Partial<IHttpEnvironmentConfig> = TEST_HTTP_ENVIRONMENT_DEFAULTS) {
        config = {
            ...TEST_HTTP_ENVIRONMENT_DEFAULTS,
            ...config,
        }
        return TestHttpEnvironment.getInstance(config)
            .withDisableErrorHandlers()
            .createHttpService();
    }

    static getBaseUrl() {
        if(typeof HttpEnvironment.getInstance().httpService.getPort() !== 'number') {
            throw new Error('Http service port is not set. Did you forget to boot?');
        }
        return `http://localhost:${HttpEnvironment.getInstance().httpService.getPort()}`;
    }

    withCsrf() {
        this.httpServiceConfig = {
            ...this.httpServiceConfig,
            beforeAllMiddlewares: [
                ...(this.httpServiceConfig.beforeAllMiddlewares ?? []),
                CsrfMiddleware.create(),
            ],
            csrf: {
                methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
                headerName: 'X-CSRF-TOKEN',
                ttl: 60 * 60 * 1, // 1 hour
                exclude: ['/csrf'],
            }
        }

        return this;
    }

    withHttpServiceConfig(config: Partial<IHttpServiceConfig>) {
        this.httpServiceConfig = {
            ...this.httpServiceConfig,
            ...config,
        }
        this.createHttpService();
        return this;
    }

    withDisableErrorHandlers() {
        this.httpServiceConfig = {
            ...this.httpServiceConfig,
            disableErrorHandlers: true,
        }
        return this;
    }

    withEnableErrorHandlers() {
        this.httpServiceConfig = {
            ...this.httpServiceConfig,
            disableErrorHandlers: false,
        }
        return this;
    }

    createHttpService() {
        HttpEnvironment.getInstance(this.config!).httpService = new HttpService({
            ...this.httpServiceConfig,
        });
        return this;
    }

    async boot() {
        await DatabaseEnvironment.create({
            boot: this.config!.databaseConfigured,
        }).boot();

        // Setup validator services
        ValidatorServices.init({
            queryBuilder: DatabaseEnvironment.getInstance().eloquentQueryBuilder,
            database: DatabaseEnvironment.getInstance().databaseService,
        });

        // Create the auth environment
        const authEnvirnonmentConfig: IAuthEnvironmentConfig = {
            environment: EnvironmentTesting,
            authConfig: {
                ...authConfig,
                drivers: {
                    jwt: {
                        ...authConfig.drivers.jwt,
                        options: {
                            ...authConfig.drivers.jwt.options,
                            secret: 'test',
                            expiresInMinutes: 60 * 24, // 24 hours
                        }
                    }
                }
            },
            routesConfig: routesConfig,
            aclConfig: aclConfig,
            secretKey: 'test',
            dependencies: {
                asyncSessionService: AsyncSessionService.getInstance(),
            },
            boot: this.config!.databaseConfigured,
        }

        await AuthEnvironment.create(authEnvirnonmentConfig).boot();

        await HttpEnvironment.getInstance(this.config!).boot();
    }

}

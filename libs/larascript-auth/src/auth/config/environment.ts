import { IAsyncSessionService } from "@larascript-framework/contracts/async-session";
import { IAuthEnvironmentConfig, IAuthEnvironmentDependencies } from "@larascript-framework/contracts/auth";
import { EnvironmentTesting } from "@larascript-framework/larascript-core";
import { aclConfig } from "./acl.config.js";
import { authConfig } from "./auth.config.js";
import { routesConfig } from "./routes.config.js";

export const DEPENDENCIES_DEFAULTS: IAuthEnvironmentDependencies = {
    asyncSessionService: {} as IAsyncSessionService,
}

export const AUTH_ENVIRONMENT_DEFAULTS: IAuthEnvironmentConfig = {
    environment: EnvironmentTesting,
    authConfig: authConfig,
    aclConfig: aclConfig,
    routesConfig: routesConfig,
    secretKey: '',
    dependencies: DEPENDENCIES_DEFAULTS,
    boot: true,
    dropAndCreateTables: false,
}
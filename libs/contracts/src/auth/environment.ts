import { EnvironmentType } from "@/core/environment.js";
import { IAsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/larascript-acl";
import { IAuthConfig, IAuthRoutesConfig } from "./config.t.js";

export type IAuthEnvironmentConfig = {
    environment: EnvironmentType;
    authConfig: IAuthConfig;
    aclConfig: IAclConfig;
    routesConfig: IAuthRoutesConfig;
    secretKey: string;
    dependencies: IAuthEnvironmentDependencies;
    boot?: boolean;
    dropAndCreateTables?: boolean;
}

export type IAuthEnvironmentDependencies = {
    asyncSessionService: IAsyncSessionService;
}
import { IAclConfig } from "@/acl/acl.js";
import { IAsyncSessionService } from "@larascript-framework/async-session";
import { EnvironmentType } from "../core/environment.js";
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
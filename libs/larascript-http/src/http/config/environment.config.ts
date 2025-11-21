import { IHttpEnvironmentConfig } from "@larascript-framework/contracts/http";
import { EnvironmentDevelopment } from "@larascript-framework/larascript-core";
import path from "path";

export const HTTP_ENVIRONMENT_DEFAULTS: IHttpEnvironmentConfig = {
    authConfigured: false,
    databaseConfigured: false,
    uploadDirectory: path.join(process.cwd(), 'storage/uploads'),
    environment: EnvironmentDevelopment,
    currentRequestCleanupDelay: 30
}
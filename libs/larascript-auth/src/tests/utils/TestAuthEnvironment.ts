import { IAuthConfig, IAuthEnvironmentConfig } from "@/auth/index.js";
import { AuthEnvironment } from "@/environment/AuthEnvironment.js";
import { testEnvironmentConfig } from "@/tests/utils/testEnvironmentConfig.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import { DatabaseEnvironment } from "@larascript-framework/larascript-database";

export class TestAuthEnvironment extends BaseSingleton<IAuthEnvironmentConfig> {

    static create(authConfig: Partial<IAuthConfig> = testEnvironmentConfig.authConfig, aclConfig: Partial<IAclConfig> = testEnvironmentConfig.aclConfig) {
        const config    = {
            ...testEnvironmentConfig,
            authConfig: {
                ...testEnvironmentConfig.authConfig,
                ...authConfig,
            },
            aclConfig: {
                ...testEnvironmentConfig.aclConfig,
                ...aclConfig,
            },
        }
        return TestAuthEnvironment.getInstance(config);
    }

    async boot() {
        AsyncSessionService.getInstance()
        
        await DatabaseEnvironment.create({
            boot: true,
        }).boot();

        await AuthEnvironment.create(this.config!).boot();
    }
}
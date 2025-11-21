

import { aclConfig } from "@/config/acl.config.js";
import { authConfig } from "@/config/auth.config.js";
import GenerateJwtSecret from "@/core/commands/GenerateJwtSecret.js";
import { app } from "@/core/services/App.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import { AuthEnvironment, IAuthRoutesConfigExtended } from "@larascript-framework/larascript-auth";
import { AuthRoutesService } from "@larascript-framework/larascript-auth-routes";
import { AppSingleton, BaseProvider } from "@larascript-framework/larascript-core";

class AuthProvider extends BaseProvider {

    protected config: IAuthRoutesConfigExtended = authConfig

    protected aclConfig: IAclConfig = aclConfig

    async register() {

        await AuthEnvironment.create({
            environment: AppSingleton.env(),
            authConfig: this.config,
            aclConfig: this.aclConfig,
            secretKey: this.config.drivers.jwt.options.secret,
            dependencies: {
                asyncSessionService: AsyncSessionService.getInstance(),
            }
        });

        // Register auth routes
        AuthRoutesService.create(this.config)

        // Register commands
        app('console').register(GenerateJwtSecret)

        this.bind('auth', AuthEnvironment.getInstance().authService);
    }

    async boot() {
        await AuthEnvironment.getInstance().boot();
    }
}

export default AuthProvider;


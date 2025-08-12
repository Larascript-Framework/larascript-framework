

import { BaseProvider, withDependencies } from "@ben-shepherd/larascript-core";
import { aclConfig } from "@src/config/acl.config";
import { authConfig } from "@src/config/auth.config";
import GenerateJwtSecret from "@src/core/domains/auth/commands/GenerateJwtSecret";
import Auth from "@src/core/domains/auth/services/AuthService";
import { app } from "@src/core/services/App";

class AuthProvider extends BaseProvider {

    protected config = authConfig

    protected aclConfig = aclConfig

    async register() {

        const authService = withDependencies(new Auth(this.config))
        await authService.boot();
        
        // Bind services
        this.bind('auth', authService);
        this.bind('auth.jwt', (() => authService.getDefaultAdapter())())

        // Register commands
        app('console').register(GenerateJwtSecret)
    }


}

export default AuthProvider;


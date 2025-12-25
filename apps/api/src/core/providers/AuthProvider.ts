import { aclConfig } from "@/config/acl.config.js";
import { authConfig } from "@/config/auth.config.js";
import GenerateJwtSecret from "@/core/commands/GenerateJwtSecret.js";
import { app, appEnv } from "@/core/services/App.js";
import { AsyncSessionService } from "@larascript-framework/async-session";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import { IAclConfig } from "@larascript-framework/contracts/acl";
import { EnvironmentType } from "@larascript-framework/contracts/larascript-core";
import {
  AuthEnvironment,
  IAuthRoutesConfigExtended,
} from "@larascript-framework/larascript-auth";
import { AuthRoutesService } from "@larascript-framework/larascript-auth-routes";

class AuthProvider extends AbstractProvider {
  protected config: IAuthRoutesConfigExtended = authConfig;

  protected aclConfig: IAclConfig = aclConfig;

  async register() {
    await AuthEnvironment.create({
      environment: appEnv() as EnvironmentType,
      authConfig: this.config,
      aclConfig: this.aclConfig,
      secretKey: this.config.drivers.jwt.options.secret,
      dependencies: {
        asyncSessionService: AsyncSessionService.getInstance(),
      },
    });

    // Register auth routes
    AuthRoutesService.create(this.config);

    // Register commands
    app("console").register(GenerateJwtSecret);

    this.bind("auth", AuthEnvironment.getInstance().authService);
  }

  async boot() {
    await AuthEnvironment.getInstance().boot();
  }
}

export default AuthProvider;

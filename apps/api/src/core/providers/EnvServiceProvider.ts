import {
  BaseProvider,
  EnvService,
  IEnvServiceConfig,
} from "@larascript-framework/larascript-core";
import path from "path";

class EnvServiceProvider extends BaseProvider {
  protected config: IEnvServiceConfig = {
    envPath: path.resolve("@/../", ".env"),
    envExamplePath: path.resolve("@/../", ".env.example"),
  };

  async register(): Promise<void> {
    const envService = new EnvService(this.config);
    this.bind("envService", envService);
  }
}

export default EnvServiceProvider;

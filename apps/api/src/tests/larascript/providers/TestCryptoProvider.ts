import { IAppConfig } from "@/config/app.config.js";
import CryptoProvider from "@/core/providers/CryptoProvider.js";
import { EnvironmentTesting } from "@larascript-framework/larascript-core";

class TestCryptoProvider extends CryptoProvider {
  config: IAppConfig = {
    env: EnvironmentTesting,
    appKey: "test-app-key",
    appName: "Larascript Framework",
  } as IAppConfig;
}

export default TestCryptoProvider;

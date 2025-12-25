import EnvServiceProvider from "@/core/providers/EnvServiceProvider.js";
import { getOutputPath } from "@/tests/larascript/test-helper/getOutputPath.js";
import { IEnvServiceConfig } from "@larascript-framework/larascript-core";

class TestEnvServiceProvider extends EnvServiceProvider {
  protected config: IEnvServiceConfig = {
    envPath: getOutputPath(".env"),
    envExamplePath: getOutputPath(".env.example"),
  };
}

export default TestEnvServiceProvider;

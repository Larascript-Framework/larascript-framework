import { BaseProvider } from "@larascript-framework/larascript-core";

import GenerateAppKey from "../commands/GenerateAppKey.js";
import { app } from "../services/App.js";

class CommandsProvider extends BaseProvider {
  async register(): Promise<void> {
    // Register commands
    app("console").registerService().registerAll([GenerateAppKey]);
  }
}

export default CommandsProvider;


import { AbstractProvider } from "@larascript-framework/bootstrap";
import GenerateAppKey from "../commands/GenerateAppKey.js";
import { app } from "../services/App.js";

class CommandsProvider extends AbstractProvider {
  async register(): Promise<void> {
    // Register commands
    app("console").registerService().registerAll([GenerateAppKey]);
  }
}

export default CommandsProvider;

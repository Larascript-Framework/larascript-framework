import commandsConfig from "@/config/commands.config.js";
import {
  ConsoleService,
  HelpCommand,
} from "@larascript-framework/larascript-console";
import { BaseProvider } from "@larascript-framework/larascript-core";
import GenerateAppKey from "../commands/GenerateAppKey.js";
import RouteListCommand from "../commands/RouteListCommand.js";

export default class ConsoleProvider extends BaseProvider {
  /**
   * Register method
   * Called when the provider is being registered
   * Use this method to set up any initial configurations or services
   */
  async register(): Promise<void> {
    await super.register();

    const console = new ConsoleService();

    // Register internal commands
    // Register commands from @/config/commands.config.ts
    console
      .registerService()
      .registerAll([GenerateAppKey, HelpCommand, RouteListCommand]);
    console.registerService().registerAll(commandsConfig);

    // Add the console service to the container
    this.bind("console", console);
  }
}

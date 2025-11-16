import BaseCommand from "../base/BaseCommand.js";
import { ICommandConstructor } from "../interfaces/ICommand.js";
import CommandRegister from "../service/CommandRegister.js";

export class HelpCommand extends BaseCommand {
  signature: string = "help";

  description = "List all available commands";

  public keepProcessAlive = false;

  /**
   * Execute the command
   */
  async execute() {
    const registerService = CommandRegister.getInstance();

    this.input.clearScreen();
    this.input.writeLine("--- Available commands ---");
    this.input.writeLine();

    // Order commands by A-Z
    const commandConstructors = Array.from<[string, ICommandConstructor]>(
      registerService.getRegistered(),
    ).sort(([, a], [, b]) => {
      const aSignature = new a().signature;
      const bSignature = new b().signature;
      return aSignature.localeCompare(bSignature);
    });

    // List commands
    commandConstructors.forEach(([, command]) => {
      const signature = new command().signature;
      const description = new command().description;

      this.input.writeLine(`- ${signature}`);
      this.input.writeLine(`  ${description ?? "No description available"}`);
      this.input.writeLine();
    });
  }
}

export default HelpCommand;
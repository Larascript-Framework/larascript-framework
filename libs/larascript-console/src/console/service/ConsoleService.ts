import { BaseSingleton } from "@larascript-framework/larascript-core";

import { ICommandConstructor } from "../index.js";
import IConsoleService from "../interfaces/IConsoleService.js";
import CommandReader from "./CommandReader.js";
import CommandRegister from "./CommandRegister.js";
import { ReadlineService } from "./ReadlineService.js";

/**
 * ConsoleService class that implements the ICommandService interface.
 * This class provides methods for creating command readers and registering commands.
 */
export class ConsoleService
  extends BaseSingleton
  implements IConsoleService
{
  get readlineInterface() {
    return ReadlineService.getInstance().readline();
  }

  /**
   * Returns a singleton instance of the CommandReader class.
   * @param argv The arguments to pass to the command reader.
   * @returns CommandReader
   */
  public readerService(argv: string[]): CommandReader {
    return new CommandReader(argv);
  }

  /**
   * Returns a singleton instance of the CommandRegister class.
   * @returns CommandRegister
   */
  public registerService(): CommandRegister {
    return CommandRegister.getInstance();
  }

  /**
   * Registers a new command.
   * @param cmdCtor The command to register.
   * @param config The configuration for the commands.
   */
  public register(cmdCtor: ICommandConstructor, config?: object) {
    return this.registerService().register(cmdCtor, config);
  }

}

export default ConsoleService;
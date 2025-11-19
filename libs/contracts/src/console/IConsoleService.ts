 import { ICommandConstructor } from "./ICommand.js";
import { ICommandReader } from "./ICommandReader.js";
import { ICommandRegister } from "./ICommandRegister.js";

/**
 * Service that provides methods for registering and executing console commands
 *
 * @interface IConsoleService
 */
export interface IConsoleService {
  /**
   * Creates a new ICommandReader instance with given argv
   *
   * @param argv
   * @returns ICommandReader
   */
  readerService: (argv: string[]) => ICommandReader;

  /**
   * Creates a new ICommandRegister instance
   *
   * @returns ICommandRegister
   */
  registerService: () => ICommandRegister;

  /**
   * Registers a new command.
   * @param cmdCtor The command to register.
   * @param config The configuration for the commands.
   */
  register: (cmdCtor: ICommandConstructor, config?: object) => void;
}

export default IConsoleService;
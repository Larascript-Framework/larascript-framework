 

import { ICommandConstructor } from "./ICommand.js";

export type Registered = Map<string, ICommandConstructor>;

/**
 * This interface provides methods for registering and retrieving commands.
 */
export interface ICommandRegister {
  /**
   * Registers a new command.
   * @param cmdCtor The command to register.
   * @param config The configuration for the commands.
   */
  register: (cmdCtor: ICommandConstructor, config?: object) => void;

  /**
   * Registers multiple commands.
   * @param cmds The commands to register.
   * @param config The configuration for the commands.
   */
  registerAll: (cmds: Array<ICommandConstructor>, config?: object) => void;

  /**
   * Adds configuration for commands.
   * @param signatures The signatures of the commands to add configuration for.
   * @param config The configuration to add.
   */
  addCommandConfig(signatures: string[], config: object): void;

  /**
   * Gets the configuration for a command.
   * @param signature The signature of the command to get configuration for.
   * @returns The configuration for the command if it exists, otherwise null.
   */
  getCommandConfig<T extends object = object>(signature: string): T | null;

  /**
   * Gets the registered commands.
   * @returns A map of command signatures to constructors.
   */
  getRegistered(): Registered;

  /**
   * Gets a command by its signature.
   * @param signature The signature of the command to get.
   * @returns The command if it exists, otherwise null.
   */
  getBySignature(string: string): ICommandConstructor | null;
}

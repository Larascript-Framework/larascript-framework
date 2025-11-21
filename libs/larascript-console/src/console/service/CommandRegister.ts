import { BaseSingleton } from "@larascript-framework/larascript-core";
import CommandRegisterException from "../exceptions/CommandRegisterException.js";
import {
  ICommandConstructor,
  ICommandRegister,
  Registered,
} from "../index.js";

export default class CommandRegister
  extends BaseSingleton
  implements ICommandRegister
{
  /**
   * Registered commands
   */
  protected commands: Registered = new Map();

  /**
   * Command configs
   * Key is the signature
   */
  protected commandConfigs: Map<string, object> = new Map();

  /**
   * Register multiple commands
   * @param cmds
   * @param config The configuration for the commands.
   */
  registerAll(cmds: Array<ICommandConstructor>, config?: object) {
    cmds.forEach((cmdCtor) => this.register(cmdCtor));

    if (config) {
      const signatures = cmds.map((cmdCtor) => new cmdCtor().signature);
      this.addCommandConfig(signatures, config);
    }
  }

  /**
   * Register a new command
   * @param cmdCtor
   * @param config The configuration for the commands.
   */
  register(cmdCtor: ICommandConstructor, config?: object) {
    const signature = new cmdCtor().signature;

    if (this.commands.has(signature)) {
      throw new CommandRegisterException(signature);
    }

    this.commands.set(signature, cmdCtor);

    if (config) {
      this.addCommandConfig([signature], config);
    }
  }

  /**
   * Add command config
   * @param cmdCtor
   * @param config
   */
  addCommandConfig(signatures: string[], config: object) {
    signatures.forEach((signature: string) =>
      this.commandConfigs.set(signature, config),
    );
  }

  /**
   * Get command config
   * @param cmdCtor
   * @returns
   */
  getCommandConfig<T extends object = object>(signature: string): T | null {
    return (this.commandConfigs.get(signature) as T) ?? null;
  }

  /**
   * Get a particular command by the key
   * @param key
   * @returns
   */
  get<CommandCtor extends ICommandConstructor>(key: string): CommandCtor {
    if (!this.commands.has(key)) {
      throw new CommandRegisterException(`Command '${key}' could not be found`);
    }

    return this.commands.get(key) as CommandCtor;
  }

  /**
   * Returns all registered commands
   * @returns
   */
  getRegistered(): Registered {
    return this.commands;
  }

  /**
   * @param string
   * @returns
   */
  getBySignature(string: string): ICommandConstructor | null {
    return (this.commands.get(string) as ICommandConstructor) ?? null;
  }
}

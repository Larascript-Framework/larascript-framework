import CommandExecutionException from "../exceptions/CommandExecutionException.js";
import { ICommand } from "../index.js";
import {
  KeyPair,
  KeyPairArguementType,
  ParsedArguement,
  ParsedArgumentsArray,
  ValueOnly,
} from "../parsers/CommandArgumentParser.js";
import ConsoleInputService from "../service/ConsoleInputService.js";

/**
 * Base command class
 *
 * @abstract
 */
export abstract class BaseCommand implements ICommand {
  /**
   * Whether the command is being mocked
   */
  public mocking = false;

  /**
   * Command signature
   */
  public signature!: string;

  /**
   * Command description
   */
  public description?: string;

  /**
   * Whether to keep the process alive after execution
   */
  public keepProcessAlive?: boolean = false;

  /**
   * Parsed arguements
   */
  protected parsedArgumenets: ParsedArgumentsArray = [];

  /**
   * Overwrite arguements
   */
  protected overwriteArgs: Record<string, string> = {};

  /**
   * Config
   */
  protected config: object | null = null;

  /**
   * Constructor
   *
   * @param config
   */
  constructor(config: object = {}) {
    this.config = config;
  }

  /**
   * Input service
   */
  get input(): ConsoleInputService {
    return ConsoleInputService.getInstance();
  }

  /**
   * Set the config
   *
   * @param config
   */
  setConfig(config: object | null) {
    this.config = config ?? null;
  }

  /**
   * Get the config
   *
   * @returns
   */
  getConfig<T extends object = object>(): T | null {
    return this.config as T | null;
  }

  /**
   * Execute the command
   *
   * @param args
   * @returns
   */
   
  abstract execute(...args: any[]): any;

  /**
   * Set the parsed arguements
   *
   * @param parsedArgumenets
   */
  setParsedArguments = (parsedArgumenets: ParsedArgumentsArray) => {
    this.parsedArgumenets = parsedArgumenets;
  };

  /**
   * Find a ParsedArguement at a given position (starts at 1)
   *
   * @param nth
   * @returns
   */
  getArguementAtPos = (nth: number): ParsedArguement | null => {
    if (nth === 0) {
      throw new CommandExecutionException(
        "Unexpected 0 value. Did you mean 1?",
      );
    }

    if (nth > (this.parsedArgumenets?.length ?? 0)) {
      return null;
    }

    const arguementAtPos = this.parsedArgumenets[nth - 1] ?? null;

    if (!arguementAtPos) {
      return null;
    }

    return arguementAtPos;
  };

  /**
   * Get an arguemenet by a given key
   */
  getArguementByKey = (key: string): ParsedArguement | null => {
    if (this.overwriteArgs[key]) {
      return {
        type: KeyPair,
        key,
        value: this.overwriteArgs[key],
      };
    }

    const foundAsOnlyArguement = this.parsedArgumenets.find((arguement) => {
      if (arguement.type !== ValueOnly) {
        return false;
      }

      if (arguement.value.includes(key)) {
        return true;
      }

      return false;
    });

    if (foundAsOnlyArguement) {
      return {
        ...foundAsOnlyArguement,
        value: "",
      };
    }

    const foundParsedArguement =
      (this.parsedArgumenets.find((arguement) => {
        if (arguement.type === ValueOnly) {
          return false;
        }

        return arguement.key === key;
      }) as KeyPairArguementType) ?? null;

    return foundParsedArguement;
  };

  /**
   * Set an overwrite arguement
   */
  setOverwriteArg(key: string, value: string) {
    this.overwriteArgs[key] = value;
  }

  /**
   * @returns {boolean} Whether the command should keep the process alive
   */
  shouldKeepProcessAlive(): boolean {
    if (
      typeof this.getConfig<{ keepProcessAlive: boolean }>()
        ?.keepProcessAlive !== "undefined"
    ) {
      return (
        this.getConfig<{ keepProcessAlive: boolean }>()?.keepProcessAlive ??
        false
      );
    }

    return this?.keepProcessAlive ?? false;
  }

  /**
   * End the process
   */
  end(success: boolean = true): void {
    // End the process
    if (!this.shouldKeepProcessAlive() && !this.mocking) {
      process.exit(success ? 0 : 1);
    }
  }
}

export default BaseCommand;
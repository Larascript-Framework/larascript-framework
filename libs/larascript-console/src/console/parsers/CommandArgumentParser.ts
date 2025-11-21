import CommandArguementParserException from "../exceptions/CommandArguementParserException.js";

export const KeyPair = "KeyPair";
export type KeyPairArguementType = {
  type: typeof KeyPair;
  key: string;
  value: string;
};

export const ValueOnly = "OnlyValue";
export type OnlyArguementType = { type: typeof ValueOnly; value: string };

export type ParsedArguement = OnlyArguementType | KeyPairArguementType;
export type ParsedArgumentsArray = Array<ParsedArguement>;

export interface CommandArgumentParserConstructor {
  new (): CommandArgumentParserConstructor;
  parseStringCommands(argv: string[]): ParsedArgumentsArray;
  parseSingleArgument(argumentStr: string): ParsedArguement | null;
}

/**
 * Class for parsing command line arguments
 *
 * @example
 *      --myArguement --myArguementWithValue="123"
 *      // Returns
 *      [
 *          {type: OnlyArg, value: 'myArguement'},
 *          {type: KeyPairArg, value: 'myArguementWithValue'}
 *      ]
 */
export default class CommandArguementParser {
  /**
   * Parse the string commands into a readable format and store them
   * in this.parsedArgs
   *
   * @param argv
   * @returns
   */
  public static parseStringCommands(argv: string[]): ParsedArgumentsArray {
    const parsedArgumentsArr: ParsedArgumentsArray = [];

    for (const command of argv) {
      const parsed = this.parseSingleArgument(command);

      if (parsed) {
        parsedArgumentsArr.push(parsed);
      }
    }

    return parsedArgumentsArr;
  }

  /**
   * Parses command arguments into a readable format
   *
   * @param argumentStr
   * @returns
   */
  public static parseSingleArgument(
    argumentStr: string,
  ): ParsedArguement | null {
    if (!argumentStr.startsWith("--")) {
      throw new CommandArguementParserException(
        `Invalid command argment: '${argumentStr}'. Did you forget to prefix with --?`,
      );
    }

    const strippedDashes = argumentStr.startsWith("--")
      ? argumentStr.slice(2)
      : argumentStr;
    const parts = strippedDashes.split("=");
    const key = parts[0];
    const value = parts[1] ?? null;

    if (value) {
      return {
        type: KeyPair,
        key,
        value: value ?? "",
      };
    }

    return { type: ValueOnly, value: argumentStr };
  }
}

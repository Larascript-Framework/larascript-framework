import CommandNotFoundException from "../exceptions/CommandNotFoundException.js";
import CommandSignatureInvalid from "../exceptions/CommandSignatureInvalid.js";
import { ICommandReader } from "../index.js";
import CommandArguementParser, {
  ParsedArgumentsArray,
} from "../parsers/CommandArgumentParser.js";
import CommandRegister from "./CommandRegister.js";

export default class CommandReader implements ICommandReader {
  /**
     * Command signature
     * 
     *  Example:
            ["--id=123", "--name=\"My Name\""]
     */
  private readonly argv: string[] = [];

  /**
   * Mock command register instance
   */
  mockCommandRegister!: CommandRegister;

  /**
     * Command signature
     * 
     *  Example:
            ["my:command", "--id=123", "--name=\"My Name\""]
     */
  constructor(argv: string[]) {
    this.argv = argv;
  }

  /**
   * Get the command register instance
   */
  get commandRegister(): CommandRegister {
    if (this.mockCommandRegister) {
      return this.mockCommandRegister;
    }
    return CommandRegister.getInstance();
  }

  /**
   * Parse the string commands into a readable format
   * and store them in this.parsedArgs
   */
  runParser(): ParsedArgumentsArray {
    const argvWithoutSignature = this.argv.splice(1);
    return CommandArguementParser.parseStringCommands(argvWithoutSignature);
  }

  /**
   * Read and execute command
   */
  async handle() {
    const signature = this.argv.length && this.argv[0];

    if (!signature) {
      throw new CommandNotFoundException();
    }

    const commandCtor = this.commandRegister.getBySignature(signature);

    if (!commandCtor) {
      throw new CommandSignatureInvalid();
    }

    const cmdConfig = this.commandRegister.getCommandConfig(signature);

    const cmd = new commandCtor();
    cmd.setConfig(cmdConfig);

    cmd.setParsedArguments(this.runParser());
    await cmd.execute();

    cmd.end();
  }
}

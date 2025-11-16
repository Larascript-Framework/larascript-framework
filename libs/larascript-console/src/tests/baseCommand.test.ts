import MockingBaseCommand from "@/console/base/MockingBaseCommand.js";
import CommandExecutionException from "@/console/exceptions/CommandExecutionException.js";
import { ParsedArgumentsArray } from "@/console/parsers/CommandArgumentParser.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { createInterface } from "./mocking.js";

// Test command classes
class TestCommand extends MockingBaseCommand {
  signature = "test";
  description = "Test command";
  async execute(): Promise<string> {
    return "Test command executed";
  }
}

class CommandWithConfig extends MockingBaseCommand {
  mocking = true;
  signature = "config-test";
  description = "Command with config";
  async execute(): Promise<object> {
    return this.config as object;
  }
}

class CommandWithArguments extends MockingBaseCommand {
  mocking = true;
  signature = "args-test";
  description = "Command with arguments";
  async execute(): Promise<object> {
    const firstArg = this.getArguementAtPos(1);
    const secondArg = this.getArguementAtPos(2);
    return { firstArg, secondArg };
  }
}

class CommandWithKeepProcessAlive extends MockingBaseCommand {
  mocking = true;
  signature = "keep-alive-test";
  description = "Command that keeps process alive";
  keepProcessAlive = true;
  async execute(): Promise<string> {
    return "Process kept alive";
  }
}

class CommandWithOverwriteArgs extends MockingBaseCommand {
  mocking = true;
  signature = "overwrite-args-test";
  description = "Command with overwrite arguments";
  async execute(): Promise<object> {
    return this.overwriteArgs;
  }
}

describe("BaseCommand Test Suite", () => {
  let testCommand: TestCommand;
  let commandWithConfig: CommandWithConfig;
  let commandWithArgs: CommandWithArguments;

  beforeEach(() => {
    testCommand = new TestCommand();
    commandWithConfig = new CommandWithConfig();
    commandWithArgs = new CommandWithArguments();
    jest.mock("node:readline", () => ({ createInterface }));
  });

  afterEach(() => {
    testCommand.end();
    commandWithConfig.end();
    commandWithArgs.end();
    jest.clearAllMocks();
  });

  describe("Constructor and Initialization", () => {
    test("should create command with default values", () => {
      expect(testCommand.signature).toBe("test");
      expect(testCommand.description).toBe("Test command");
      expect(testCommand.keepProcessAlive).toBe(false);
    });

    test("should create command with custom config", () => {
      const config = { timeout: 5000 };
      const command = new TestCommand(config);
      expect(command).toBeInstanceOf(TestCommand);
    });

    test("should create command with keepProcessAlive set to true", () => {
      const command = new CommandWithKeepProcessAlive();
      expect(command.keepProcessAlive).toBe(true);
    });
  });

  describe("Signature and Description", () => {
    test("should have correct signature", () => {
      expect(testCommand.signature).toBe("test");
    });

    test("should have correct description", () => {
      expect(testCommand.description).toBe("Test command");
    });

    test("should allow empty signature", () => {
      class EmptySignatureCommand extends MockingBaseCommand {
        signature = "";
        description = "Empty signature command";
        async execute(): Promise<string> {
          return "Empty signature command executed";
        }
      }

      const command = new EmptySignatureCommand();
      expect(command.signature).toBe("");
    });

    test("should allow special characters in signature", () => {
      class SpecialSignatureCommand extends MockingBaseCommand {
        signature = "test:command:with:colons";
        description = "Special signature command";
        async execute(): Promise<string> {
          return "Special signature command executed";
        }
      }

      const command = new SpecialSignatureCommand();
      expect(command.signature).toBe("test:command:with:colons");
    });
  });

  describe("Configuration Management", () => {
    // test("should set configuration", () => {
    //     const config = { timeout: 5000, retry: 3 };
    //     testCommand.setConfig(config);
    //
    //     expect(testCommand.execute()).resolves.toEqual(config as object);
    // });
    // test("should merge configuration with existing config", () => {
    //     const initialConfig = { timeout: 1000 };
    //     const additionalConfig = { retry: 3 };
    //
    //     testCommand.setConfig(initialConfig);
    //     testCommand.setConfig(additionalConfig);
    //
    //     // The setConfig method should merge or replace the config
    //     expect(testCommand.execute()).resolves.toEqual(additionalConfig);
    // });
    // test("should handle empty configuration object", () => {
    //     testCommand.setConfig({});
    //     expect(testCommand.execute()).resolves.toEqual({});
    // });
    // test("should handle undefined configuration", () => {
    //     testCommand.setConfig(undefined as any);
    //     expect(testCommand.execute()).resolves.toEqual(undefined);
    // });
  });

  describe("Argument Management", () => {
    test("should set parsed arguments", () => {
      const args = [
        { key: "id", value: "123", type: "key-pair" },
        { key: "name", value: "test", type: "key-pair" },
      ];

      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      expect(testCommand.getArguementAtPos(1)).toEqual(args[0]);
      expect(testCommand.getArguementAtPos(2)).toEqual(args[1]);
    });

    test("should get argument at position 1", () => {
      const args = [{ key: "test", value: "value", type: "key-pair" }];
      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      const result = testCommand.getArguementAtPos(1);
      expect(result).toEqual(args[0]);
    });

    test("should get argument at position 2", () => {
      const args = [
        { key: "first", value: "value1", type: "key-pair" },
        { key: "second", value: "value2", type: "key-pair" },
      ];
      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      const result = testCommand.getArguementAtPos(2);
      expect(result).toEqual(args[1]);
    });

    test("should return null for non-existent position", () => {
      const args = [{ key: "test", value: "value", type: "key-pair" }];
      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      const result = testCommand.getArguementAtPos(2);
      expect(result).toBeNull();
    });

    test("should return null for position beyond array length", () => {
      const args = [{ key: "test", value: "value", type: "key-pair" }];
      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      const result = testCommand.getArguementAtPos(10);
      expect(result).toBeNull();
    });

    test("should throw error for position 0", () => {
      expect(() => testCommand.getArguementAtPos(0)).toThrow(
        CommandExecutionException,
      );
    });

    test("should throw CommandExecutionException with correct message for position 0", () => {
      try {
        testCommand.getArguementAtPos(0);
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionException);
        if (error instanceof CommandExecutionException) {
          expect(error.message).toContain(
            "Unexpected 0 value. Did you mean 1?",
          );
        }
      }
    });

    test("should handle empty arguments array", () => {
      testCommand.setParsedArguments([] as ParsedArgumentsArray);

      expect(testCommand.getArguementAtPos(1)).toBeNull();
    });

    test("should handle undefined arguments", () => {
      testCommand.setParsedArguments(undefined as any as ParsedArgumentsArray);

      expect(testCommand.getArguementAtPos(1)).toBeNull();
    });
  });

  describe("Command Execution", () => {
    test("should execute command successfully", async () => {
      const result = await testCommand.execute();
      console.log("[DEBUG] result 2", result);
      expect(result).toBe("Test command executed");
    });

    test("should execute command with arguments", async () => {
      const args = [
        { key: "first", value: "value1", type: "key-pair" },
        { key: "second", value: "value2", type: "key-pair" },
      ];

      commandWithArgs.setParsedArguments(args as ParsedArgumentsArray);

      const result = await commandWithArgs.execute();
      expect(result).toEqual({
        firstArg: args[0],
        secondArg: args[1],
      });
    });

    test("should execute command with configuration", async () => {
      const config = { timeout: 5000 };
      commandWithConfig.setConfig(config);

      const result = await commandWithConfig.execute();
      expect(result).toEqual(config);
    });
  });

  describe("Process Management", () => {
    test("should have keepProcessAlive set to false by default", () => {
      expect(testCommand.keepProcessAlive).toBe(false);
    });

    test("should allow keepProcessAlive to be set to true", () => {
      const command = new CommandWithKeepProcessAlive();
      expect(command.keepProcessAlive).toBe(true);
    });

    test("should allow keepProcessAlive to be overridden", () => {
      testCommand.keepProcessAlive = true;
      expect(testCommand.keepProcessAlive).toBe(true);
    });
  });

  describe("Overwrite Arguments", () => {
    test("should execute command with overwrite arguments", async () => {
      const command = new CommandWithOverwriteArgs();

      const result = await command.execute();
      expect(result).toEqual({});
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle command with no description", () => {
      class NoDescriptionCommand extends MockingBaseCommand {
        signature = "no-desc";
        execute = async () => {
          return "No description command executed";
        };
      }

      const command = new NoDescriptionCommand();
      expect(command.description).toBeUndefined();
    });

    test("should handle command with null description", () => {
      class NullDescriptionCommand extends MockingBaseCommand {
        signature = "null-desc";
        description = null as any;
        execute = async () => {
          return "Null description command executed";
        };
      }

      const command = new NullDescriptionCommand();
      expect(command.description).toBeNull();
    });

    test("should handle command with numeric description", () => {
      class NumericDescriptionCommand extends MockingBaseCommand {
        signature = "numeric-desc";
        description = 123 as any;
        execute = async () => {
          return "Numeric description command executed";
        };
      }

      const command = new NumericDescriptionCommand();
      expect(command.description).toBe(123);
    });

    test("should handle command with complex configuration object", async () => {
      class ComplexConfigCommand extends MockingBaseCommand {
        signature = "complex-config";
        description = 123 as any;
        execute = async () => {
          return this.config;
        };
      }
      const complexConfig = {
        timeout: 5000,
        retry: { max: 3, backoff: "exponential" },
        headers: { "Content-Type": "application/json" },
        nested: { deep: { value: "test" } },
      };

      const command = new ComplexConfigCommand();
      command.setConfig(complexConfig);
      const result = await command.execute();

      expect(result).toEqual(complexConfig);
    });
  });

  describe("Integration Scenarios", () => {
    test("should handle complete command lifecycle", async () => {
      // Setup command with configuration and arguments
      const config = { timeout: 5000, retry: 3 };
      const args = [
        { key: "id", value: "123", type: "key-pair" },
        { key: "name", value: "test", type: "key-pair" },
      ];

      testCommand.setConfig(config);
      testCommand.setParsedArguments(args as ParsedArgumentsArray);

      // Verify setup
      expect(testCommand.getArguementAtPos(1)).toEqual(args[0]);
      expect(testCommand.getArguementAtPos(2)).toEqual(args[1]);

      // Execute command
      const result = await testCommand.execute();
      expect(result).toBe("Test command executed");
    });

    test("should handle multiple commands with different configurations", async () => {
      const command1 = new TestCommand({ timeout: 1000 });
      const command2 = new TestCommand({ timeout: 2000 });

      const result1 = command1.getConfig();
      const result2 = command2.getConfig();

      expect(result1).toEqual({ timeout: 1000 });
      expect(result2).toEqual({ timeout: 2000 });
    });
  });
});

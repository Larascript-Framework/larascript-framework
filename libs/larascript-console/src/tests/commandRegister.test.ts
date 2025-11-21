// import BaseCommand from "@/console/base/BaseCommand.js";
import BaseCommand from "@/console/base/BaseCommand.js";
import CommandRegisterException from "@/console/exceptions/CommandRegisterException.js";
import CommandRegister from "@/console/service/CommandRegister.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

// Test command classes
class TestCommand extends BaseCommand {
  signature = "test";
  description = "Test command";
  execute = async () => {
    return "Test command executed";
  };
}

class AnotherTestCommand extends BaseCommand {
  signature = "another-test";
  description = "Another test command";
  execute = async () => {
    return "Another test command executed";
  };
}

class DuplicateSignatureCommand extends BaseCommand {
  signature = "test"; // Same signature as TestCommand
  description = "Duplicate signature command";
  execute = async () => {
    return "Duplicate command executed";
  };
}

describe("CommandRegister Test Suite", () => {
  let commandRegister: CommandRegister;

  beforeEach(() => {
    // Get a fresh instance for each test
    commandRegister = CommandRegister.getInstance();

    // Clear the registered commands by accessing the protected property
    // This is a workaround since the class doesn't have a public clear method
    const commandsMap = (commandRegister as any).commands;
    const configsMap = (commandRegister as any).commandConfigs;
    commandsMap.clear();
    configsMap.clear();
  });

  describe("Singleton Pattern", () => {
    test("should return the same instance", () => {
      const instance1 = CommandRegister.getInstance();
      const instance2 = CommandRegister.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Command Registration", () => {
    test("should register a command successfully", () => {
      commandRegister.register(TestCommand);

      const registered = commandRegister.getRegistered();
      expect(registered.has("test")).toBe(true);
      expect(registered.get("test")).toBe(TestCommand);
    });

    test("should register multiple commands", () => {
      commandRegister.register(TestCommand);
      commandRegister.register(AnotherTestCommand);

      const registered = commandRegister.getRegistered();
      expect(registered.size).toBe(2);
      expect(registered.has("test")).toBe(true);
      expect(registered.has("another-test")).toBe(true);
    });

    test("should throw CommandRegisterException when registering duplicate command", () => {
      commandRegister.register(TestCommand);

      expect(() => {
        commandRegister.register(DuplicateSignatureCommand);
      }).toThrow(CommandRegisterException);
    });

    test("should throw CommandRegisterException with correct signature in message", () => {
      commandRegister.register(TestCommand);

      try {
        commandRegister.register(DuplicateSignatureCommand);
      } catch (error) {
        expect(error).toBeInstanceOf(CommandRegisterException);
        if (error instanceof CommandRegisterException) {
          expect(error.message).toContain("test");
        }
      }
    });
  });

  describe("Command Retrieval", () => {
    beforeEach(() => {
      commandRegister.register(TestCommand);
      commandRegister.register(AnotherTestCommand);
    });

    test("should get command by signature", () => {
      const command = commandRegister.getBySignature("test");
      expect(command).toBe(TestCommand);
    });

    test("should get command by another signature", () => {
      const command = commandRegister.getBySignature("another-test");
      expect(command).toBe(AnotherTestCommand);
    });

    test("should return null for non-existent signature", () => {
      const command = commandRegister.getBySignature("non-existent");
      expect(command).toBeNull();
    });

    test("should get command by key", () => {
      const command = commandRegister.get<typeof TestCommand>("test");
      expect(command).toBe(TestCommand);
    });

    test("should get command by another key", () => {
      const command =
        commandRegister.get<typeof AnotherTestCommand>("another-test");
      expect(command).toBe(AnotherTestCommand);
    });

    test("should throw CommandRegisterException for non-existent key", () => {
      expect(() => {
        commandRegister.get("non-existent");
      }).toThrow(CommandRegisterException);
    });

    test("should throw CommandRegisterException with correct message for non-existent key", () => {
      try {
        commandRegister.get("non-existent");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandRegisterException);
        if (error instanceof CommandRegisterException) {
          expect(error.message).toContain(
            "Command 'non-existent' could not be found",
          );
        }
      }
    });
  });

  describe("Command Configuration", () => {
    test("should add command configuration", () => {
      const config = { timeout: 5000, retry: 3 };
      commandRegister.addCommandConfig(["test"], config);

      const retrievedConfig = commandRegister.getCommandConfig("test");
      expect(retrievedConfig).toEqual(config);
    });

    test("should add configuration for multiple signatures", () => {
      const config = { global: true };
      commandRegister.addCommandConfig(["test", "another-test"], config);

      expect(commandRegister.getCommandConfig("test")).toEqual(config);
      expect(commandRegister.getCommandConfig("another-test")).toEqual(config);
    });

    test("should get command configuration", () => {
      const config = { retry: 3 };
      commandRegister.register(TestCommand, config);

      const retrievedConfig = commandRegister.getCommandConfig("test");
      expect(retrievedConfig).toEqual(config);
    });

    test("should return null for non-existent command configuration", () => {
      const config = commandRegister.getCommandConfig("non-existent");
      expect(config).toBeNull();
    });

    test("should override existing configuration", () => {
      const initialConfig = { timeout: 1000 };
      const newConfig = { timeout: 5000 };

      commandRegister.addCommandConfig(["test"], initialConfig);
      commandRegister.addCommandConfig(["test"], newConfig);

      const retrievedConfig = commandRegister.getCommandConfig("test");
      expect(retrievedConfig).toEqual(newConfig);
    });
  });

  describe("Bulk Registration", () => {
    test("should register multiple commands at once", () => {
      const commands = [TestCommand, AnotherTestCommand];
      commandRegister.registerAll(commands);

      const registered = commandRegister.getRegistered();
      expect(registered.size).toBe(2);
      expect(registered.has("test")).toBe(true);
      expect(registered.has("another-test")).toBe(true);
    });

    test("should register multiple commands with configuration", () => {
      const commands = [TestCommand, AnotherTestCommand];
      const config = { global: true, timeout: 5000 };

      commandRegister.registerAll(commands, config);

      expect(commandRegister.getCommandConfig("test")).toEqual(config);
      expect(commandRegister.getCommandConfig("another-test")).toEqual(config);
    });

    test("should handle empty commands array", () => {
      const commands: Array<any> = [];
      commandRegister.registerAll(commands);

      const registered = commandRegister.getRegistered();
      expect(registered.size).toBe(0);
    });

    test("should handle empty commands array with config", () => {
      const commands: Array<any> = [];
      const config = { global: true };

      commandRegister.registerAll(commands, config);

      const registered = commandRegister.getRegistered();
      expect(registered.size).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    test("should handle command with empty signature", () => {
      class EmptySignatureCommand extends BaseCommand {
        signature = "";
        description = "Empty signature command";
        execute = async () => {
          return "Empty signature command executed";
        };
      }

      commandRegister.register(EmptySignatureCommand);

      const registered = commandRegister.getRegistered();
      expect(registered.has("")).toBe(true);
    });

    test("should handle command with special characters in signature", () => {
      class SpecialSignatureCommand extends BaseCommand {
        signature = "test:command:with:colons";
        description = "Special signature command";
        execute = async () => {
          return "Special signature command executed";
        };
      }

      commandRegister.register(SpecialSignatureCommand);

      const registered = commandRegister.getRegistered();
      expect(registered.has("test:command:with:colons")).toBe(true);
    });

    test("should handle command with numeric signature", () => {
      class NumericSignatureCommand extends BaseCommand {
        signature = "123";
        description = "Numeric signature command";
        execute = async () => {
          return "Numeric signature command executed";
        };
      }

      commandRegister.register(NumericSignatureCommand);

      const registered = commandRegister.getRegistered();
      expect(registered.has("123")).toBe(true);
    });
  });

  describe("Integration Scenarios", () => {
    test("should handle complex registration and retrieval workflow", () => {
      // Register commands
      commandRegister.register(TestCommand, { timeout: 1000 });
      commandRegister.register(AnotherTestCommand, { timeout: 2000 });

      // Verify registration
      expect(commandRegister.getRegistered().size).toBe(2);

      // Retrieve commands
      const testCommand = commandRegister.getBySignature("test");
      const anotherCommand = commandRegister.getBySignature("another-test");

      expect(testCommand).toBe(TestCommand);
      expect(anotherCommand).toBe(AnotherTestCommand);

      // Verify configurations
      expect(commandRegister.getCommandConfig("test")).toEqual({
        timeout: 1000,
      });
      expect(commandRegister.getCommandConfig("another-test")).toEqual({
        timeout: 2000,
      });
    });

    test("should handle registration, unregistration (via clear), and re-registration", () => {
      // Initial registration
      commandRegister.register(TestCommand);
      expect(commandRegister.getRegistered().has("test")).toBe(true);

      // Clear (simulated by accessing protected property)
      const commandsMap = (commandRegister as any).commands;
      commandsMap.clear();

      // Verify cleared
      expect(commandRegister.getRegistered().size).toBe(0);

      // Re-register
      commandRegister.register(TestCommand);
      expect(commandRegister.getRegistered().has("test")).toBe(true);
    });
  });
});

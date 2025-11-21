import BaseCommand from "@/console/base/BaseCommand.js";
import CommandNotFoundException from "@/console/exceptions/CommandNotFoundException.js";
import CommandSignatureInvalid from "@/console/exceptions/CommandSignatureInvalid.js";
import { KeyPair } from "@/console/parsers/CommandArgumentParser.js";
import CommandReader from "@/console/service/CommandReader.js";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

// Mock command for testing
class MockCommand extends BaseCommand {
  signature = "mock:command";
  description = "Mock command for testing";
  execute = async () => {
    return "Mock command executed";
  };
}

class MockCommandArgumentParser {
  parseStringCommands = jest.fn().mockReturnValue([]);
}

// Mock the app function and console service
jest.mock(
  "@src/core/services/App",
  () => ({
    app: jest.fn(),
  }),
  { virtual: true },
);

describe("CommandReader Test Suite", () => {
  let commandReader: CommandReader;
  let mockApp: jest.Mocked<any>;
  let mockConsoleService: jest.Mocked<any>;
  let mockCommandRegister: jest.Mocked<any>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock console service
    mockCommandRegister = {
      getBySignature: jest.fn(),
      getCommandConfig: jest.fn(),
    };

    mockConsoleService = {
      registerService: jest.fn().mockReturnValue(mockCommandRegister),
    };

    mockApp = require("@src/core/services/App").app;
    mockApp.mockReturnValue(mockConsoleService);
  });

  describe("Constructor and Initialization", () => {
    test("should create CommandReader with argv array", () => {
      const argv = ["command", "--arg1=value1", "--arg2=value2"];
      commandReader = new CommandReader(argv);
      expect(commandReader).toBeInstanceOf(CommandReader);
    });

    test("should handle empty argv array", () => {
      commandReader = new CommandReader([]);
      expect(commandReader).toBeInstanceOf(CommandReader);
    });

    test("should handle single command without arguments", () => {
      const argv = ["command"];
      commandReader = new CommandReader(argv);
      expect(commandReader).toBeInstanceOf(CommandReader);
    });
  });

  describe("runParser Method", () => {
    test("should remove first element and parse remaining arguments", () => {
      const argv = ["command", "--id=123", "--name=test"];
      commandReader = new CommandReader(argv);

      // Mock the CommandArguementParser.parseStringCommands method
      const mockParsedArgs = [
        { key: "id", value: "123", type: KeyPair },
        { key: "name", value: "test", type: KeyPair },
      ];

      const result = commandReader.runParser();
      expect(result).toEqual(mockParsedArgs);
    });

    test("should handle single command with no additional arguments", () => {
      const argv = ["command"];
      commandReader = new CommandReader(argv);

      const result = commandReader.runParser();
      expect(result).toEqual([]);
    });
  });

  describe("handle Method", () => {
    beforeEach(() => {
      commandReader = new CommandReader(["mock:command", "--arg=value"]);
    });

    test("should throw CommandNotFoundException when no signature provided", async () => {
      commandReader = new CommandReader([]);

      await expect(commandReader.handle()).rejects.toThrow(
        CommandNotFoundException,
      );
    });

    test("should throw CommandSignatureInvalid when command not found", async () => {
      mockCommandRegister.getBySignature.mockReturnValue(null);

      await expect(commandReader.handle()).rejects.toThrow(
        CommandSignatureInvalid,
      );
    });

    test("should execute command successfully when found", async () => {
      const mockCommand = new MockCommand();
      const mockConfig = { timeout: 5000 };

      mockCommandRegister.getBySignature.mockReturnValue(MockCommand);
      mockCommandRegister.getCommandConfig.mockReturnValue(mockConfig);

      // Mock the command instance methods
      jest.spyOn(mockCommand, "setConfig").mockReturnValue(undefined);
      jest.spyOn(mockCommand, "setParsedArguments").mockReturnValue(undefined);
      jest.spyOn(mockCommand, "execute").mockResolvedValue("Success");
      jest.spyOn(mockCommand, "end").mockReturnValue(undefined);

      // Mock the constructor to return our mock instance
      const MockCommandConstructor = jest
        .fn()
        .mockImplementation(() => mockCommand);
      mockCommandRegister.getBySignature.mockReturnValue(
        MockCommandConstructor,
      );

      commandReader.mockCommandRegister = mockCommandRegister;
      await commandReader.handle();

      expect(mockCommand.setConfig).toHaveBeenCalledWith(mockConfig);
      expect(mockCommand.setParsedArguments).toHaveBeenCalled();
      expect(mockCommand.execute).toHaveBeenCalled();
      expect(mockCommand.end).toHaveBeenCalled();
    });

    test("should handle command with no configuration", async () => {
      const mockCommand = new MockCommand();

      mockCommandRegister.getBySignature.mockReturnValue(MockCommand);
      mockCommandRegister.getCommandConfig.mockReturnValue(null);

      jest.spyOn(mockCommand, "setConfig").mockReturnValue(undefined);
      jest.spyOn(mockCommand, "setParsedArguments").mockReturnValue(undefined);
      jest.spyOn(mockCommand, "execute").mockResolvedValue("Success");
      jest.spyOn(mockCommand, "end").mockReturnValue(undefined);

      const MockCommandConstructor = jest
        .fn()
        .mockImplementation(() => mockCommand);
      mockCommandRegister.getBySignature.mockReturnValue(
        MockCommandConstructor,
      );

      try {
        await commandReader.handle();
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(CommandSignatureInvalid);
      }
    });
  });

  describe("Error Handling", () => {
    test("should handle CommandNotFoundException correctly", async () => {
      const argv: string[] = [];
      commandReader = new CommandReader(argv);

      await expect(commandReader.handle()).rejects.toThrow(
        CommandNotFoundException,
      );
    });
  });
});

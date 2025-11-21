import CommandArguementParserException from "@/console/exceptions/CommandArguementParserException.js";
import CommandExecutionException from "@/console/exceptions/CommandExecutionException.js";
import CommandNotFoundException from "@/console/exceptions/CommandNotFoundException.js";
import CommandRegisterException from "@/console/exceptions/CommandRegisterException.js";
import CommandSignatureInvalid from "@/console/exceptions/CommandSignatureInvalid.js";
import { describe, expect, test } from "@jest/globals";

describe("Console Exceptions Test Suite", () => {
  describe("CommandRegisterException", () => {
    test("should create exception with default message", () => {
      const exception = new CommandRegisterException("test");

      expect(exception).toBeInstanceOf(CommandRegisterException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBeDefined();
    });

    test("should create exception with custom message", () => {
      const customMessage = "Custom registration error message";
      const exception = new CommandRegisterException("test", customMessage);

      expect(exception.message).toBe("Custom registration error message");
    });

    test("should create exception with custom message and replace name", () => {
      const customMessage = "Custom registration error message: {name}";
      const exception = new CommandRegisterException("test", customMessage);

      expect(exception.message).toBe("Custom registration error message: test");
    });

    test("should create exception with signature in message", () => {
      const signature = "test:command";
      const exception = new CommandRegisterException(signature);
      expect(exception.message).toContain(signature);
    });

    test("should be throwable", () => {
      expect(() => {
        throw new CommandRegisterException("test");
      }).toThrow(CommandRegisterException);
    });

    test("should preserve stack trace", () => {
      try {
        throw new CommandRegisterException("test");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandRegisterException);
        if (error instanceof CommandRegisterException) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
        }
      }
    });
  });

  describe("CommandNotFoundException", () => {
    test("should create exception with default message", () => {
      const exception = new CommandNotFoundException();
      expect(exception).toBeInstanceOf(CommandNotFoundException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBeDefined();
    });

    test("should create exception with custom message", () => {
      const customMessage = "Custom not found error message";
      const exception = new CommandNotFoundException(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    test("should have correct name", () => {
      const exception = new CommandNotFoundException();
      expect(exception.name).toBe("CommandNotFoundException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new CommandNotFoundException("Test error");
      }).toThrow(CommandNotFoundException);
    });

    test("should preserve stack trace", () => {
      try {
        throw new CommandNotFoundException("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandNotFoundException);
        if (error instanceof CommandNotFoundException) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
        }
      }
    });
  });

  describe("CommandSignatureInvalid", () => {
    test("should create exception with default message", () => {
      const exception = new CommandSignatureInvalid();
      expect(exception).toBeInstanceOf(CommandSignatureInvalid);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBeDefined();
    });

    test("should create exception with custom message", () => {
      const customMessage = "Custom signature invalid error message";
      const exception = new CommandSignatureInvalid(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    test("should have correct name", () => {
      const exception = new CommandSignatureInvalid();
      expect(exception.name).toBe("CommandSignatureInvalid");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new CommandSignatureInvalid("Test error");
      }).toThrow(CommandSignatureInvalid);
    });

    test("should preserve stack trace", () => {
      try {
        throw new CommandSignatureInvalid("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandSignatureInvalid);
        if (error instanceof CommandSignatureInvalid) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
        }
      }
    });
  });

  describe("CommandExecutionException", () => {
    test("should create exception with default message", () => {
      const exception = new CommandExecutionException();
      expect(exception).toBeInstanceOf(CommandExecutionException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBeDefined();
    });

    test("should create exception with custom message", () => {
      const customMessage = "Custom execution error message";
      const exception = new CommandExecutionException(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    test("should have correct name", () => {
      const exception = new CommandExecutionException();
      expect(exception.name).toBe("CommandExecutionException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new CommandExecutionException("Test error");
      }).toThrow(CommandExecutionException);
    });

    test("should preserve stack trace", () => {
      try {
        throw new CommandExecutionException("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionException);
        if (error instanceof CommandExecutionException) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
        }
      }
    });
  });

  describe("CommandArguementParserException", () => {
    test("should create exception with default message", () => {
      const exception = new CommandArguementParserException();
      expect(exception).toBeInstanceOf(CommandArguementParserException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBeDefined();
    });

    test("should create exception with custom message", () => {
      const customMessage = "Custom argument parser error message";
      const exception = new CommandArguementParserException(customMessage);
      expect(exception.message).toBe(customMessage);
    });

    test("should have correct name", () => {
      const exception = new CommandArguementParserException();
      expect(exception.name).toBe("CommandArguementParserException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new CommandArguementParserException("Test error");
      }).toThrow(CommandArguementParserException);
    });

    test("should preserve stack trace", () => {
      try {
        throw new CommandArguementParserException("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandArguementParserException);
        if (error instanceof CommandArguementParserException) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
        }
      }
    });
  });

  describe("Exception Inheritance and Properties", () => {
    test("all exceptions should inherit from Error", () => {
      const exceptions = [
        new CommandRegisterException("test"),
        new CommandNotFoundException(),
        new CommandSignatureInvalid(),
        new CommandExecutionException(),
        new CommandArguementParserException(),
      ];

      exceptions.forEach((exception) => {
        expect(exception).toBeInstanceOf(Error);
        expect(exception.name).toBeDefined();
        expect(exception.message).toBeDefined();
        expect(exception.stack).toBeDefined();
      });
    });

    test("all exceptions should have unique names", () => {
      const exceptionNames = [
        CommandRegisterException.name,
        CommandNotFoundException.name,
        CommandSignatureInvalid.name,
        CommandExecutionException.name,
        CommandArguementParserException.name,
      ];

      const uniqueNames = new Set(exceptionNames);
      expect(uniqueNames.size).toBe(exceptionNames.length);
    });

    test("all exceptions should be constructible with and without message", () => {
      const ExceptionClasses = [
        CommandRegisterException,
        CommandNotFoundException,
        CommandSignatureInvalid,
        CommandExecutionException,
        CommandArguementParserException,
      ];

      ExceptionClasses.forEach((ExceptionClass) => {
        if (ExceptionClass === CommandRegisterException) {
          const exceptionWithMessage = new ExceptionClass("test");
          expect(exceptionWithMessage).toBeInstanceOf(ExceptionClass);
          expect(exceptionWithMessage.message).toBeDefined();
        } else {
          const exceptionWithoutMessage = new (ExceptionClass as any)();
          const exceptionWithMessage = new (ExceptionClass as any)(
            "Test message",
          );

          expect(exceptionWithoutMessage).toBeInstanceOf(ExceptionClass);
          expect(exceptionWithMessage).toBeInstanceOf(ExceptionClass);
          expect(exceptionWithMessage.message).toBe("Test message");
        }
      });
    });
  });

  describe("Exception Usage Patterns", () => {
    test("should handle CommandRegisterException in try-catch", () => {
      try {
        throw new CommandRegisterException("Duplicate command");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandRegisterException);
        if (error instanceof CommandRegisterException) {
          expect(error.message).toBe(
            "Command 'Duplicate command' could not be registered. A command with the same signature may already exist.",
          );
          expect(error.name).toBe("CommandRegisterException");
        }
      }
    });

    test("should handle CommandNotFoundException in try-catch", () => {
      try {
        throw new CommandNotFoundException("Command not found");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandNotFoundException);

        if (error instanceof CommandNotFoundException) {
          expect(error.message).toBe("Command not found");
          expect(error.name).toBe("CommandNotFoundException");
        }
      }
    });

    test("should handle CommandSignatureInvalid in try-catch", () => {
      try {
        throw new CommandSignatureInvalid("Invalid signature");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandSignatureInvalid);
        if (error instanceof CommandSignatureInvalid) {
          expect(error.message).toBe("Invalid signature");
          expect(error.name).toBe("CommandSignatureInvalid");
        }
      }
    });

    test("should handle CommandExecutionException in try-catch", () => {
      try {
        throw new CommandExecutionException("Execution failed");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionException);
        if (error instanceof CommandExecutionException) {
          expect(error.message).toBe("Execution failed");
          expect(error.name).toBe("CommandExecutionException");
        }
      }
    });

    test("should handle CommandArguementParserException in try-catch", () => {
      try {
        throw new CommandArguementParserException("Parser failed");
      } catch (error) {
        expect(error).toBeInstanceOf(CommandArguementParserException);
        if (error instanceof CommandArguementParserException) {
          expect(error.message).toBe("Parser failed");
          expect(error.name).toBe("CommandArguementParserException");
        }
      }
    });
  });

  describe("Exception Message Content", () => {
    test("CommandRegisterException should include signature in message", () => {
      const signature = "test:command";
      const exception = new CommandRegisterException(signature);
      expect(exception.message).toContain(signature);
    });

    test("CommandRegisterException should handle empty signature", () => {
      const exception = new CommandRegisterException("");
      expect(exception.message).toBeDefined();
    });

    test("CommandRegisterException should handle undefined signature", () => {
      const exception = new CommandRegisterException(undefined as any);
      expect(exception.message).toBeDefined();
    });

    test("CommandRegisterException should handle null signature", () => {
      const exception = new CommandRegisterException(null as any);
      expect(exception.message).toBeDefined();
    });
  });
});

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import winston from "winston";
import { ILoggerConfig } from "../interfaces/index.js";
import { LoggerService } from "../services/LoggerService.js";

// Mock winston
jest.mock("winston", () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe("LoggerService", () => {
  let loggerService: LoggerService;
  let mockConfig: ILoggerConfig;
  let mockLogger: Record<string, jest.Mock>;
  let consoleSpy: unknown;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock console.log
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Setup mock config
    mockConfig = {
      logPath: "/tmp/test.log",
    };

    // Setup mock logger
    mockLogger = {
      error: jest.fn(),
      help: jest.fn(),
      data: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    // Mock winston.createLogger to return our mock logger
    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);

    // Mock winston.format methods
    (winston.format.combine as jest.Mock).mockReturnValue("combined-format");
    (winston.format.timestamp as jest.Mock).mockReturnValue("timestamp-format");
    (winston.format.printf as jest.Mock).mockReturnValue("printf-format");

    // Mock winston.transports
    (winston.transports.Console as unknown as jest.Mock).mockImplementation(
      () => ({}),
    );
    (winston.transports.File as unknown as jest.Mock).mockImplementation(
      () => ({}),
    );

    // Create logger service instance
    loggerService = new LoggerService(mockConfig);
  });

  describe("Constructor", () => {
    test("should create instance with config", () => {
      expect(loggerService).toBeInstanceOf(LoggerService);
      expect(
        (loggerService as unknown as { config: ILoggerConfig }).config,
      ).toBe(mockConfig);
    });
  });

  describe("boot()", () => {
    test("should initialize winston logger on first call", () => {
      loggerService.boot();

      expect(winston.createLogger).toHaveBeenCalledWith({
        level: "info",
        format: expect.anything(),
        transports: expect.arrayContaining([
          expect.any(Object), // Console transport
          expect.any(Object), // File transport
        ]),
      });

      expect(winston.format.combine).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
      );
      expect(winston.format.timestamp).toHaveBeenCalledWith({
        format: "YYYY-MM-DD HH:mm:ss",
      });
    });

    test("should not reinitialize logger on subsequent calls", () => {
      // First call
      loggerService.boot();
      const firstCallCount = (winston.createLogger as jest.Mock).mock.calls
        .length;

      // Second call
      loggerService.boot();
      const secondCallCount = (winston.createLogger as jest.Mock).mock.calls
        .length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    test("should return early if logger is already initialized", () => {
      // First call to initialize
      loggerService.boot();

      // Mock the logger property to simulate it being already set
      (loggerService as unknown as { logger: unknown }).logger = mockLogger;

      // Second call should return early
      loggerService.boot();

      // Verify that createLogger was only called once
      expect(winston.createLogger).toHaveBeenCalledTimes(1);
    });

    test("should create file transport with correct path", () => {
      loggerService.boot();

      expect(winston.transports.File).toHaveBeenCalledWith({
        filename: mockConfig.logPath,
      });
    });
  });

  describe("getLogger()", () => {
    test("should return winston logger instance", () => {
      loggerService.boot();
      const logger = loggerService.getLogger();

      expect(logger).toBe(mockLogger);
    });
  });

  describe("Logging Methods", () => {
    beforeEach(() => {
      loggerService.boot();
    });

    describe("error()", () => {
      test("should log error message", () => {
        const message = "Test error message";
        loggerService.error(message);

        expect(mockLogger.error).toHaveBeenCalledWith([message]);
      });

      test("should log multiple error arguments", () => {
        const arg1 = "Error";
        const arg2 = "details";
        loggerService.error(arg1, arg2);

        expect(mockLogger.error).toHaveBeenCalledWith([arg1, arg2]);
      });
    });

    describe("help()", () => {
      test("should log help message", () => {
        const message = "Help message";
        loggerService.help(message);

        expect(mockLogger.help).toHaveBeenCalledWith([message]);
      });
    });

    describe("data()", () => {
      test("should log data message", () => {
        const data = { key: "value" };
        loggerService.data(data);

        expect(mockLogger.data).toHaveBeenCalledWith([data]);
      });
    });

    describe("info()", () => {
      test("should log info message", () => {
        const message = "Info message";
        loggerService.info(message);

        expect(mockLogger.info).toHaveBeenCalledWith([message]);
      });
    });

    describe("warn()", () => {
      test("should log warning message", () => {
        const message = "Warning message";
        loggerService.warn(message);

        expect(mockLogger.warn).toHaveBeenCalledWith([message]);
      });
    });

    describe("debug()", () => {
      test("should log debug message", () => {
        const message = "Debug message";
        loggerService.debug(message);

        expect(mockLogger.debug).toHaveBeenCalledWith([message]);
      });
    });

    describe("verbose()", () => {
      test("should log verbose message", () => {
        const message = "Verbose message";
        loggerService.verbose(message);

        expect(mockLogger.verbose).toHaveBeenCalledWith([message]);
      });
    });

    describe("console()", () => {
      test("should output directly to console", () => {
        const message = "Console message";
        loggerService.console(message);

        expect(consoleSpy).toHaveBeenCalledWith([message]);
      });

      test("should output multiple arguments to console", () => {
        const arg1 = "First";
        const arg2 = "Second";
        loggerService.console(arg1, arg2);

        expect(consoleSpy).toHaveBeenCalledWith([arg1, arg2]);
      });
    });

    describe("exception()", () => {
      test("should log error message and stack trace", () => {
        const error = new Error("Test exception");
        error.stack = "Error stack trace";

        loggerService.exception(error);

        expect(mockLogger.error).toHaveBeenCalledWith([
          error.message,
          error.stack,
        ]);
      });

      test("should handle error without stack trace", () => {
        const error = new Error("Test exception");
        delete (error as unknown as { stack?: string }).stack;

        loggerService.exception(error);

        expect(mockLogger.error).toHaveBeenCalledWith([
          error.message,
          undefined,
        ]);
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle logging before boot is called", () => {
      // This should throw an error since logger is not initialized
      expect(() => {
        loggerService.info("test");
      }).toThrow("Cannot read properties of undefined (reading 'info')");
    });

    test("should handle empty arguments", () => {
      loggerService.boot();

      expect(() => {
        loggerService.info();
        loggerService.error();
        loggerService.warn();
      }).not.toThrow();
    });

    test("should handle null and undefined arguments", () => {
      loggerService.boot();

      expect(() => {
        loggerService.info(null, undefined);
        loggerService.error(null);
        loggerService.warn(undefined);
      }).not.toThrow();
    });
  });
});

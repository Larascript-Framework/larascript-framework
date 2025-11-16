import { AppSingleton, dependencyLoader, withDependencies } from "@/app/index.js";
import { Environment } from "@/consts/index.js";
import { Kernel } from "@/kernel/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  AlternativeDependencyLoaderProvider,
  LoggerProvider,
  MockFailedConnectionDatabaseProvider,
  MockSuccessfulConnectionDatabaseProvider,
} from "./providers/providers.js";

describe("Dependency Loader Test Suite", () => {
  beforeEach(async () => {
    // Reset the kernel before each test
    Kernel.reset();
  });

  describe("AppSingleton.dependencies() method", () => {
    test("should return a function that can retrieve containers", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [new LoggerProvider()],
        },
        {},
      );

      const loader = AppSingleton.dependencies();
      const logger = loader("logger");

      expect(loader).toBeInstanceOf(Function);
      expect(logger).toBeDefined();
    });
  });

  describe("dependencyLoader() function", () => {
    test("should provide access to the application's dependency loader", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [new LoggerProvider()],
        },
        {},
      );

      const loader = dependencyLoader();
      const logger = loader("logger");

      expect(loader).toBeInstanceOf(Function);
      expect(logger).toBeDefined();
    });
  });

  describe("withDependencies() function", () => {
    test("should inject dependencies into an instance", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [new LoggerProvider()],
        },
        {},
      );

      const mockService = {
        setDependencyLoader: jest.fn(),
      };

      const result = withDependencies(mockService);

      expect(result).toBe(mockService);
      expect(mockService.setDependencyLoader).toHaveBeenCalledWith(
        dependencyLoader(),
      );
    });
  });

  describe("Kernel with successful database provider", () => {
    test("should have logged a connection successful, logger should contain success message", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [
            new LoggerProvider(),
            new MockSuccessfulConnectionDatabaseProvider(),
          ],
        },
        {},
      );

      const database = AppSingleton.container("database");
      const logger = AppSingleton.container("logger");

      await database.connect();

      expect(logger.containsLog("Connection OK")).toBe(true);
      expect(logger.containsLog("Connection FAILED")).toBe(false);
    });
  });

  describe("Kernel with failed database provider using withDependencies", () => {
    test("should have logged a connection failed, logger should contain failure message", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [
            new LoggerProvider(),
            new MockFailedConnectionDatabaseProvider(),
          ],
        },
        {},
      );

      const database = AppSingleton.container("database");
      const logger = AppSingleton.container("logger");

      await database.connect();

      expect(logger.containsLog("Connection FAILED")).toBe(true);
      expect(logger.containsLog("Connection OK")).toBe(false);
    });
  });

  describe("AltProvider using dependencyLoader", () => {
    test("should work with dependencyLoader function", async () => {
      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [
            new LoggerProvider(),
            new AlternativeDependencyLoaderProvider(),
          ],
        },
        {},
      );

      const database = AppSingleton.container("database");
      const logger = AppSingleton.container("logger");

      await database.connect();

      expect(logger.containsLog("Connection FAILED")).toBe(true);
    });
  });
});

import { AppSingleton, CreateDependencyLoader } from "@/app/index.js";
import { Environment } from "@/consts/index.js";
import { Kernel } from "@/kernel/index.js";
import { describe } from "@jest/globals";
import {
  AlternativeDependencyLoaderProvider,
  LoggerProvider,
  MockSuccessfulConnectionDatabaseProvider,
  TestContainers,
} from "./providers/providers.js";
import LoggerService from "./services/LoggerService.js";
import MockDatabaseService from "./services/MockDatabaseService.js";

describe("Dependency Loader Test Suite", () => {
  describe("Kernel with successful database provider", () => {
    beforeAll(async () => {
      Kernel.reset();

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
    });

    test("should have logged a connection successful, logger should contain success message", async () => {
      const database = AppSingleton.container<TestContainers, "database">(
        "database",
      );
      const logger = AppSingleton.container<TestContainers, "logger">("logger");

      await database.connect();

      expect(logger.containsLog("Connection OK")).toBeTruthy();
    });
  });

  describe("Kernel with connection failed database provider, logger should contain failed message", () => {
    beforeAll(async () => {
      Kernel.reset();

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
    });

    test("should have logged a connection failed", async () => {
      const database = AppSingleton.container<TestContainers, "database">(
        "database",
      );
      const logger = AppSingleton.container<TestContainers, "logger">("logger");

      await database.connect();

      expect(logger.containsLog("Connection FAILED")).toBeTruthy();
    });

    test("should create dependency loader", async () => {
      const loader = CreateDependencyLoader.create({
        logger: new LoggerService(),
      });

      const database = new MockDatabaseService();
      database.setDependencyLoader(loader);

      expect(typeof database.logger?.log === "function").toBeTruthy();
    });
  });
});

import { withDependencies } from "../../../app/index.js";
import { BaseProvider } from "../../../base/index.js";
import AltMockDatabaseService from "../services/AltMockDatabaseService.js";
import LoggerService from "../services/LoggerService.js";
import MockDatabaseService from "../services/MockDatabaseService.js";

export type TestContainers = {
  example: string;
  object: {
    value: 1;
  };
  logger: LoggerService;
  database: MockDatabaseService;
};

export class TestProvider extends BaseProvider {
  async register(): Promise<void> {
    this.bind("example", "hello world");
    this.bind("object", { value: 1 });
  }
}

export class LoggerProvider extends BaseProvider {
  async register(): Promise<void> {
    this.bind("logger", new LoggerService());
  }
}

export class MockSuccessfulConnectionDatabaseProvider extends BaseProvider {
  async register(): Promise<void> {
    const database = withDependencies(
      new MockDatabaseService({
        connectionWillSucceed: true,
      }),
    );

    this.bind("database", database);
  }
}

export class MockFailedConnectionDatabaseProvider extends BaseProvider {
  async register(): Promise<void> {
    const database = withDependencies(
      new MockDatabaseService({
        connectionWillSucceed: false,
      }),
    );

    this.bind("database", database);
  }
}

export class AlternativeDependencyLoaderProvider extends BaseProvider {
  async register(): Promise<void> {
    const database = withDependencies(
      new AltMockDatabaseService({
        connectionWillSucceed: false,
      }),
    );

    this.bind("database", database);
  }
}

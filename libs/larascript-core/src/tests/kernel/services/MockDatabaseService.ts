import { DependencyLoader, RequiresDependency } from "@larascript-framework/contracts/larascript-core";
import { TestContainers } from "../interfaces/containers.js";

type MockDatabaseServiceOptions = {
  connectionWillSucceed: boolean;
};

class MockDatabaseService implements RequiresDependency {
  logger!: TestContainers["logger"];

  constructor(
    protected options: MockDatabaseServiceOptions = {
      connectionWillSucceed: true,
    },
    protected connected: boolean = false,
  ) {}

  setDependencyLoader(loader: DependencyLoader): void {
    this.logger = loader<TestContainers, "logger">("logger") as TestContainers["logger"];
  }

  async connect(): Promise<boolean> {
    if (false === this.options.connectionWillSucceed) {
      this.logger.log("Connection FAILED");
      this.connected = false;
      return false;
    }

    this.logger.log("Connection OK");
    this.connected = true;
    return true;
  }

  reset() {
    this.connected = false;
    this.options.connectionWillSucceed = true;
  }
}

export default MockDatabaseService;

import { BaseProvider } from "@larascript-framework/larascript-core";
import { LoggerService } from "@larascript-framework/larascript-logger";
import path from "path";

class LoggerProvider extends BaseProvider {
  async register(): Promise<void> {
    const loggerService = new LoggerService({
      logPath: path.resolve("@/../", "storage/logs/larascript.log"),
    });

    // We will boot the logger here to provide it early for other providers
    loggerService.boot();

    // Bind the logger service to the container
    this.bind("logger", loggerService);
  }
}

export default LoggerProvider;

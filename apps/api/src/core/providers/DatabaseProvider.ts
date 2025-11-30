import appConfig, { IAppConfig } from "@/config/app.config.js";
import databaseConfig from "@/config/database.config.js";
import { BaseProvider } from "@larascript-framework/larascript-core";
import {
  DatabaseEnvironment,
  IDatabaseConfig,
} from "@larascript-framework/larascript-database";
import { app } from "../services/App.js";

export default class DatabaseProvider extends BaseProvider {
  protected config: IDatabaseConfig = databaseConfig;

  protected appConfig: IAppConfig = appConfig;

  async register(): Promise<void> {
    DatabaseEnvironment.create({
      databaseConfig: this.config,
      dependencies: {
        logger: app("logger"),
        console: app("console"),
        cryptoService: app("crypto"),
        dispatcher: (...args: any[]) =>
          app("events").dispatch(...args) as Promise<void>,
      },
      boot: true,
    });

    this.bind("db", DatabaseEnvironment.getInstance().databaseService);
    this.bind("query", DatabaseEnvironment.getInstance().eloquentQueryBuilder);
  }

  async boot(): Promise<void> {
    await DatabaseEnvironment.getInstance().boot();
  }
}

import { databaseConfig } from "@/config/config/database.config.js";
import { IConsoleService } from "@larascript-framework/contracts/console";
import {
  IDatabaseEnvironment,
  IDatabaseEnvironmentOptions,
} from "@larascript-framework/contracts/database/environment";
import { CryptoService, ICryptoService } from "@larascript-framework/crypto-js";
import { ConsoleService } from "@larascript-framework/larascript-console";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import {
  DatabaseService,
  DB,
  EloquentQueryBuilderService,
  IDatabaseService,
  IEloquentQueryBuilderService,
} from "@larascript-framework/larascript-database";
import {
  ILoggerService,
  LoggerService,
} from "@larascript-framework/larascript-logger";
import path from "path";

export const DEFAULTS: IDatabaseEnvironmentOptions = {
  databaseConfig: databaseConfig,
  dependencies: {
    logger: undefined,
    console: undefined,
    cryptoService: undefined,
    dispatcher: undefined,
  },
};

/**
 * Represents the environment configuration for the database.
 * Extends the BaseSingleton class with IDatabaseEnvironmentOptions.
 */
export class DatabaseEnvironment
  extends BaseSingleton<IDatabaseEnvironmentOptions>
  implements IDatabaseEnvironment
{
  databaseService!: IDatabaseService;
  logger!: ILoggerService;
  console!: IConsoleService;
  cryptoService!: ICryptoService;
  dispatcher!: (...args: any[]) => Promise<void>;
  eloquentQueryBuilder!: IEloquentQueryBuilderService;

  /**
   * Constructs a new DatabaseEnvironment instance.
   * @param {IDatabaseEnvironmentOptions} config - The configuration options for the database environment.
   */
  constructor(config: IDatabaseEnvironmentOptions) {
    super({
      ...DEFAULTS,
      ...config,
    });
    this.setupServices();
  }

  /**
   * Creates and returns an instance of DatabaseEnvironment.
   * @param {IDatabaseEnvironmentOptions} options - The options to configure the database environment.
   * @returns {DatabaseEnvironment} The instance of DatabaseEnvironment.
   */
  static create(options: IDatabaseEnvironmentOptions) {
    const instance = DatabaseEnvironment.getInstance(options);
    instance.setupServices();
    return instance;
  }

  setupServices() {
    if (!this.config) {
      throw new Error("Config is not set");
    }
    this.databaseService =
      this.config.dependencies?.databaseService ??
      new DatabaseService(this.config.databaseConfig ?? databaseConfig);
    this.eloquentQueryBuilder =
      this.config.dependencies?.eloquentQueryBuilder ??
      new EloquentQueryBuilderService();
    this.setDependencies(this.config);
    this.databaseService.register();
  }

  /**
   * Sets the dependencies for the database environment.
   * @param {IDatabaseEnvironmentOptions} config - The configuration options containing dependencies.
   */
  setDependencies(config: IDatabaseEnvironmentOptions) {
    if (!this.logger) {
      this.logger =
        config.dependencies?.logger ??
        new LoggerService({
          logPath: path.join(process.cwd(), "storage/logs"),
        });
    }
    if (!this.console) {
      this.console = config.dependencies?.console ?? new ConsoleService();
    }
    if (!this.cryptoService) {
      this.cryptoService =
        config.dependencies?.cryptoService ??
        new CryptoService({
          secretKey: config.secretKey ?? "",
        });
    }
    if (!this.dispatcher) {
      this.dispatcher =
        config.dependencies?.dispatcher ?? (() => Promise.resolve());
    }
    if (!this.eloquentQueryBuilder) {
      this.eloquentQueryBuilder =
        config.dependencies?.eloquentQueryBuilder ??
        new EloquentQueryBuilderService();
    }
  }

  /**
   * Boots the database environment, initializing necessary services.
   * If the database is already initialized, it returns immediately.
   * @returns {Promise<void>} A promise that resolves when the boot process is complete.
   */
  async boot() {
    if (DB.getInstance().isInitialized()) {
      return;
    }

    this.logger?.boot();

    DB.init({
      databaseService:
        this.databaseService ?? ({} as unknown as IDatabaseService),
      eloquentQueryBuilder:
        this.eloquentQueryBuilder ??
        ({} as unknown as IEloquentQueryBuilderService),
      cryptoService: this.cryptoService ?? ({} as unknown as ICryptoService),
      dispatcher: this.dispatcher,
      console: this.console ?? ({} as unknown as IConsoleService),
      logger: this.logger,
    });

    if (this.getConfig()?.boot) {
      await this.connect();
    }
  }

  /**
   * Connects to the database by registering and booting the database service.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */
  async connect() {
    await DB.getInstance().databaseService().boot();
  }

  /**
   * Disconnects from the database by closing the adapter.
   * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
   */
  async disconnect() {
    await DB.getInstance().databaseService().getAdapter().close();
  }

  /**
   * Reconnects to the database by first disconnecting and then connecting again.
   * If the database is not initialized, it returns immediately.
   * @returns {Promise<void>} A promise that resolves when the reconnection is complete.
   */
  async reconnect() {
    if (!DB.getInstance().isInitialized()) {
      return;
    }
    await this.disconnect();
    await this.connect();
  }
}

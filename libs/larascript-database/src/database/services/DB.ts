import { DependencyLoader, RequiresDependency } from "@larascript-framework/contracts/larascript-core";
import { ICryptoService } from "@larascript-framework/crypto-js";
import { IConsoleService } from "@larascript-framework/larascript-console";
import {
  BaseSingleton,
  CreateDependencyLoader,
} from "@larascript-framework/larascript-core";
import { ILoggerService } from "@larascript-framework/larascript-logger";
import { IEloquent, IEloquentQueryBuilderService } from "../../eloquent/index.js";
import { IModel, ModelConstructor } from "../../model/index.js";
import { IDatabaseService } from "../interfaces/index.js";

export type InitTypes = {
  app?: (name: string) => unknown;
  databaseService: IDatabaseService;
  eloquentQueryBuilder: IEloquentQueryBuilderService;
  cryptoService: ICryptoService;
  dispatcher: (...args: any[]) => Promise<void>;
  logger?: ILoggerService;
  console: IConsoleService;
};

export class DB extends BaseSingleton implements RequiresDependency {
  protected _databaseService!: IDatabaseService;

  protected _eloquentQueryBuilderService!: IEloquentQueryBuilderService;

  protected _cryptoService!: ICryptoService;

  protected _dispatcher!: (...args: any[]) => Promise<void>;

  protected _logger?: ILoggerService;

  protected _console!: IConsoleService;

  protected _initialized = false;

  public static init({
    databaseService,
    eloquentQueryBuilder,
    cryptoService,
    dispatcher,
    logger,
    console,
  }: InitTypes) {
    DB.getInstance().setDependencyLoader(
      CreateDependencyLoader.create({
        databaseService,
        eloquentQueryBuilder,
        cryptoService,
        dispatcher,
        logger,
        console,
      }),
    );
  }

  setDependencyLoader(loader: DependencyLoader): void {
    if (typeof loader("eloquentQueryBuilder") === "undefined") {
      throw new Error("EloquentQueryBuilderService is not a valid dependency");
    }

    if (typeof loader("databaseService") === "undefined") {
      throw new Error("DatabaseService is not a valid dependency");
    }

    if (typeof loader("cryptoService") === "undefined") {
      throw new Error("CryptoService is not a valid dependency");
    }

    if (typeof loader("dispatcher") === "undefined") {
      throw new Error("Dispatcher is not a valid dependency");
    }

    if (typeof loader("console") === "undefined") {
      throw new Error("ConsoleService is not a valid dependency");
    }

    this._databaseService = loader("databaseService");
    this._eloquentQueryBuilderService = loader("eloquentQueryBuilder");
    this._cryptoService = loader("cryptoService");
    this._dispatcher = loader("dispatcher");
    this._logger = loader("logger");
    this._console = loader("console");
    this._initialized = true;
  }

  databaseService(): IDatabaseService {

    if (!this._databaseService) {
      throw new Error("DatabaseService is not initialized");
    }

    return this._databaseService;
  }

  queryBuilderService(): IEloquentQueryBuilderService {
    if (!this._eloquentQueryBuilderService) {
      throw new Error("EloquentQueryBuilderService is not initialized");
    }

    return this._eloquentQueryBuilderService;
  }

  queryBuilder<Model extends IModel>(
    modelCtor: ModelConstructor<Model>,
    connectionName?: string,
  ): IEloquent<Model> {
    if (!this._eloquentQueryBuilderService) {
      throw new Error("EloquentQueryBuilderService is not initialized");
    }

    return this._eloquentQueryBuilderService.builder(modelCtor, connectionName);
  }

  cryptoService(): ICryptoService {
    if (!this._cryptoService) {
      throw new Error("CryptoService is not initialized");
    }

    return this._cryptoService;
  }

  dispatcher(...args: any[]): Promise<void> {
    if (!this._dispatcher) {
      throw new Error("Dispatcher is not initialized");
    }

    return this._dispatcher(...args);
  }

  logger(): ILoggerService | undefined {
    if (!this._logger) {
      return undefined;
    }

    return this._logger;
  }

  console(): IConsoleService {
    if (!this._console) {
      throw new Error("ConsoleService is not initialized");
    }
    return this._console;
  }

  isInitialized(): boolean {
    return this._initialized;
  }
}

export default DB;

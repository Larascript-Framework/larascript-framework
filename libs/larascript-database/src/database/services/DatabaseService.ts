import {
  DependencyLoader,
  RequiresDependency,
} from "@larascript-framework/contracts/larascript-core";
import { ILoggerService } from "@larascript-framework/larascript-logger";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { IMongoDbAdapter } from "../../mongodb-adapter/interfaces/index.js";
import { IPostgresAdapter } from "../../postgres-adapter/interfaces/index.js";
import DatabaseConnectionException from "../exceptions/DatabaseConnectionException.js";
import {
  IDatabaseAdapter,
  IDatabaseAdapterConstructor,
  IDatabaseConfig,
  IDatabaseSchema,
  IDatabaseService,
} from "../interfaces/index.js";
import DatabaseAdapter from "./DatabaseAdapter.js";

/**
 * Database Service
 * - Registers database adapters, connections
 * - Connects to default and keep alive connections
 */
export class DatabaseService implements IDatabaseService, RequiresDependency {
  protected connectionsConfig: Record<string, Record<string, unknown>> = {};

  protected adapters: Record<string, IDatabaseAdapter> = {};

  protected logger?: ILoggerService;

  protected overrideDefaultConnectionName?: string;

  /**
   * Constructs an instance of the Database class.
   *
   * @param config - The database configuration object implementing IDatabaseConfig interface.
   */
  constructor(protected readonly config: IDatabaseConfig) {}

  setDependencyLoader(loader: DependencyLoader): void {
    this.logger = loader("logger");
  }

  /**
   * Boot method
   * Called after all providers have been registered
   * Use this method to perform any actions that require other services to be available
   *
   * @returns {Promise<void>}
   */
  async boot(): Promise<void> {
    if (!this.shouldConnectOnBoot()) {
      this.log("Database is not configured to connect on boot");
      return;
    }

    await this.connectDefault();
    await this.connectKeepAlive();
  }

  /**
   * @template T - The type of the configuration object to return. Defaults to IDatabaseConfig.
   * @returns {T} The database configuration object.
   */
  getConfig<T = IDatabaseConfig>(): T {
    return this.config as T;
  }

  getConnectionConfig(connectionName: string): Record<string, unknown> {
    return this.connectionsConfig[connectionName];
  }

  /**
   * Logs a message to the console with the 'info' log level, prefixed with '[Database] '.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(message: string, ...args: any[]): void {
    this.logger?.info(`[DatabaseService] ${message}`, ...args);
  }

  /**
   * Returns true if the database should connect on boot, false otherwise.
   * 1. If onBootConnect is explicitly set to true or false in the database configuration, then return that value.
   * 2. If onBootConnect is not set in the database configuration, then return true.
   *
   * @returns {boolean} True if the database should connect on boot, false otherwise.
   * @private
   */
  private shouldConnectOnBoot(): boolean {
    if (this.config.onBootConnect !== undefined) {
      return this.config.onBootConnect;
    }

    return true;
  }

  /**
   * Determines whether logging is enabled for the database operations.
   *
   * @returns {boolean} True if logging is enabled, false otherwise.
   */

  showLogs(): boolean {
    return this.config?.enableLogging ?? false;
  }

  /**
   * Connects to the default database connection.
   */
  async connectDefault(): Promise<void> {
    if (!this.connectionsConfig[this.getDefaultConnectionName()]) {
      throw new DatabaseConnectionException(
        "Connection not found: " + this.getDefaultConnectionName(),
      );
    }

    await this.connectAdapter(this.getDefaultConnectionName());
  }

  /**
   * Connects to all keep alive connections
   */
  async connectKeepAlive(): Promise<void> {
    const connections = (this.config?.keepAliveConnections ?? "").split(",");

    for (const connectionName of connections) {
      if (connectionName.length === 0) {
        continue;
      }
      if (connectionName === this.config.defaultConnectionName) {
        continue;
      }

      await this.connectAdapter(connectionName);
    }
  }

  register() {
    for (const connectionConfig of this.config.connections) {
      const { connectionName, adapter, options } = connectionConfig;

      this.addConnection(connectionName, adapter, options);
    }
  }

  addConnection<Adapter extends IDatabaseAdapter = IDatabaseAdapter>(
    connectionName: string,
    adapter: IDatabaseAdapterConstructor<Adapter>,
    connectionConfig: ReturnType<Adapter["getConfig"]>,
  ) {
    if (this.connectionsConfig[connectionName]) {
      throw new Error("Connection '" + connectionName + "' already defined");
    }

    this.connectionsConfig[connectionName] = connectionConfig as Record<
      string,
      unknown
    >;
    this.adapters[connectionName] = new adapter(
      connectionName,
      connectionConfig,
    );
  }

  /**
   * Connects to the adapter for a given connection name.
   *
   * If the adapter has already been connected and registered, this method does nothing.
   * Otherwise, it creates a new instance of the adapter, connects it, and registers it for the given connection name.
   *
   * @param connectionName The name of the connection to connect to.
   * @returns {Promise<void>}
   * @private
   */
  async connectAdapter(
    connectionName: string = this.getDefaultConnectionName(),
  ): Promise<void> {
    if (!this.adapters[connectionName]) {
      throw new DatabaseConnectionException(
        "Adapter not found: " + connectionName,
      );
    }

    this.log("Connecting to database (Connection: " + connectionName + ")");

    await this.adapters[connectionName].connectDefault();
  }

  /**
   * Checks if a connection is a specified provider (adapter)
   * @param adapterName
   * @param connectionName
   * @returns
   */
  isRegisteredAdapter(
    adapter: IDatabaseAdapterConstructor<IDatabaseAdapter>,
  ): boolean {
    const adapterName = DatabaseAdapter.getName(adapter);

    for (const connectionName of Object.keys(this.adapters)) {
      if (
        DatabaseAdapter.getName(this.getAdapterConstructor(connectionName)) ===
        adapterName
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the default connection name
   * @returns
   */
  getDefaultConnectionName(): string {
    return (
      this.overrideDefaultConnectionName ?? this.config.defaultConnectionName
    );
  }

  /**
   * Set the default connection name
   * @param name
   */
  setDefaultConnectionName(name: string | null) {
    this.overrideDefaultConnectionName = name ?? undefined;
  }

  /**
   * Get the adapter constructor for the given connection name.
   *
   * @param connectionName The name of the connection to get the adapter for.
   * @returns The constructor for the adapter.
   * @throws {Error} If the connection or adapter is not registered.
   */
  getAdapterConstructor<Adapter extends IDatabaseAdapter = IDatabaseAdapter>(
    connectionName: string = this.getDefaultConnectionName(),
  ): IDatabaseAdapterConstructor<Adapter> {
    if (!this.adapters[connectionName]) {
      throw new Error("Connection not found: " + connectionName);
    }

    return this.adapters[connectionName]
      .constructor as IDatabaseAdapterConstructor<Adapter>;
  }

  /**
   * Get the adapter for the given connection name.
   *
   * @param connectionName The name of the connection to get the adapter for.
   * @returns The adapter instance for the given connection.
   * @throws {Error} If the connection or adapter is not registered.
   */
  getAdapter<Adapter extends IDatabaseAdapter = IDatabaseAdapter>(
    connectionName: string = this.getDefaultConnectionName(),
  ): Adapter {
    if (!this.adapters[connectionName]) {
      throw new Error("Adapter not found: " + connectionName);
    }

    return this.adapters[connectionName] as Adapter;
  }

  /**
   * Retrieves all registered database adapters.
   *
   * @returns {IDatabaseAdapter[]} An array of all registered database adapter instances.
   */
  getAllAdapterConstructors(): TClassConstructor<IDatabaseAdapter>[] {
    const adaptersObject = Object.keys(this.connectionsConfig).reduce(
      (acc, connectionName) => {
        const adapter = this.adapters[connectionName as string];
        acc[
          DatabaseAdapter.getName(
            adapter.constructor as TClassConstructor<IDatabaseAdapter>,
          )
        ] = adapter.constructor;
        return acc;
      },
      {},
    );

    return Object.values(
      adaptersObject,
    ) as TClassConstructor<IDatabaseAdapter>[];
  }

  /**
   * Get the default credentials for a given adapter name.
   *
   * The default credentials are retrieved from the adapter's `getDefaultCredentials` method.
   *
   * @param adapterName The name of the adapter to get the default credentials for.
   * @returns The default credentials for the adapter, or null if they could not be retrieved.
   */
  getDefaultCredentials(adapterName: string): string | null {
    const adapters = Object.values(this.adapters).filter(adapter => adapter._adapter_type_ === adapterName)
    if(!adapters[0]) {
      throw new Error(`Connection not found: ${adapterName}`)
    }
    return adapters[0].getDefaultCredentials()
  }

  /**
   * Get the schema service
   *
   * @param connectionName
   * @returns
   */
  schema<TSchema extends IDatabaseSchema = IDatabaseSchema>(
    connectionName: string = this.getDefaultConnectionName(),
  ): TSchema {
    return this.getAdapter(connectionName).getSchema() as TSchema;
  }

  /**
   * Creates the migrations schema for the database
   * @param tableName The name of the table to create
   * @param connectionName The connection name to use for the migration schema
   * @returns A promise that resolves when the schema has been created
   */
  async createMigrationSchema(
    tableName: string,
    connectionName: string = this.getDefaultConnectionName(),
  ): Promise<unknown> {
    return await this.getAdapter(connectionName).createMigrationSchema(
      tableName,
    );
  }

  postgres(
    connectionName: string = this.getDefaultConnectionName(),
  ): IPostgresAdapter {
    const adapter = this.getAdapter(connectionName);

    if (adapter._adapter_type_ !== "postgres") {
      throw new Error("Adapter is not a PostgresAdapter: " + connectionName);
    }

    return adapter as unknown as IPostgresAdapter;
  }

  mongodb(
    connectionName: string = this.getDefaultConnectionName(),
  ): IMongoDbAdapter {
    const adapter = this.getAdapter(connectionName);

    if (adapter._adapter_type_ !== "mongodb") {
      throw new Error("Adapter is not a MongoDBAdapter: " + connectionName);
    }

    return adapter as unknown as IMongoDbAdapter;
  }

  /**
   * Get the available adapters names
   * @returns
   */
  getAvailableAdaptersNames(): string[] {
    // TODO: This should come from the adapter classes themselves.
    // Ideally, it should be using the _adapter_type_ property.
    return ["postgres", "mongodb"];
  }
}

export default DatabaseService;

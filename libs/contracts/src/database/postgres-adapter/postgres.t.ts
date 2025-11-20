import { TClassConstructor } from "@/core/constructor.js";
import pg from "pg";
import { QueryInterface, Sequelize } from "sequelize";
import { IDatabaseAdapter } from "../database/adapter.js";
import { IDatabaseSchema } from "../database/schema.js";
import { IEloquent } from "../eloquent/eloquent.t.js";
import { IModel } from "../model/model.t.js";
import { IPostgresConfig } from "./IPostgresConfig.js";

/**
 * Interface for PostgreSQL database adapter
 * Extends the base database adapter interface and adds PostgreSQL-specific functionality
 */
export interface IPostgresAdapter extends IDatabaseAdapter {
  /**
   * Get the configuration object containing the uri and options for the PostgreSQL connection
   * @returns {IPostgresConfig} The PostgreSQL configuration
   */
  getConfig(): IPostgresConfig;

  /**
   * Returns the default Postgres credentials extracted from the docker-compose file
   * @returns {string | null} The default Postgres credentials
   */
  getDefaultCredentials(): string | null;

  /**
   * Gets the pg Pool instance
   * @returns {pg.Pool} The pool instance
   */
  getPool(): pg.Pool;

  /**
   * Connect to the PostgreSQL database
   *
   * Creates the default database if it does not exist
   * and sets up the Sequelize client
   *
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  connectDefault(): Promise<void>;

  /**
   * Creates the default database if it does not exist
   * @returns {Promise<void>} A promise that resolves when the default database has been created
   * @throws {Error} If an error occurs while creating the default database
   */
  createDefaultDatabase(): Promise<void>;

  /**
   * Check if the database connection is established
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): Promise<boolean>;

  /**
   * Gets the schema interface for the database
   * @returns {IDatabaseSchema} The schema interface
   */
  getSchema(): IDatabaseSchema;

  /**
   * Retrieves the constructor for a Postgres query builder.
   *
   * @template Model The type of model to be queried, extends IModel.
   * @returns {TClassConstructor<IEloquent<Model>>} The constructor of the query builder.
   */
  getEloquentConstructor<Model extends IModel>(): TClassConstructor<
    IEloquent<Model>
  >;

  /**
   * Creates the migrations schema for the database
   * @param tableName The name of the table to create
   * @returns A promise that resolves when the schema has been created
   */
  createMigrationSchema(tableName: string): Promise<unknown>;

  /**
   * Get the query interface for the database
   * @returns {QueryInterface} The query interface
   */
  getSequelizeQueryInterface(): Promise<QueryInterface>;

  /**
   * Get the sequelize instance
   * @returns {Sequelize} The sequelize instance
   */
  getSequelize(): Promise<Sequelize>;

  /**
   * Get a new PostgreSQL client instance.
   *
   * @param config - Optional configuration object. Defaults to the adapter's config.
   * @returns {pg.Client} A new instance of PostgreSQL client.
   */
  getPgClient(config?: IPostgresConfig): pg.Client;

  /**
   * Get a new PostgreSQL client instance connected to a specific database.
   *
   * @param database - The name of the database to connect to. Defaults to 'postgres'
   * @returns {pg.Client} A new instance of PostgreSQL client.
   */
  getPgClientWithDatabase(database?: string): pg.Client;

  /**
   * Close the database connection.
   *
   * This method is a wrapper around the close method of the underlying
   * PostgreSQL client. It is used to close the database connection when
   * the application is shutting down or when the database connection is
   * no longer needed.
   *
   * @returns {Promise<void>} A promise that resolves when the connection is closed.
   */
  close(): Promise<void>;
}

/**
 * Constructor interface for PostgresAdapter
 */
export interface IPostgresAdapterConstructor
  extends TClassConstructor<IPostgresAdapter> {
  new (connectionName: string, config: IPostgresConfig): IPostgresAdapter;
}

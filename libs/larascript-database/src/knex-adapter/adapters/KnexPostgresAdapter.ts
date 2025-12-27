import { extractDefaultPostgresCredentials, IPostgresConfig } from "@/postgres-adapter/index.js";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import pg from "pg";
import BaseDatabaseAdapter from "../../database/base/BaseDatabaseAdapter.js";
import { IDatabaseSchema } from "../../database/index.js";
import DB from "../../database/services/DB.js";
import { IEloquent } from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import { IKnexPostgresAdapter } from "../contracts/adapter.js";
import { IKnexPostgresConfig } from "../contracts/config.js";
import KnexEloquent from "../eloquent/KnexEloquent.js";
import { KnexClient } from "../KnexClient.js";

/**
 * PostgresAdapter is responsible for managing the connection and operations with a PostgreSQL database.
 *
 * @class
 * @extends BaseDatabaseAdapter<IPostgresConfig>
 */
export class KnexPostgresAdapter extends BaseDatabaseAdapter<IKnexPostgresConfig> implements IKnexPostgresAdapter
{
  _adapter_type_ = "knex_postgres";

  /**
   * The name of the Docker Compose file associated with the database
   */
  protected dockerComposeFileName: string = "docker-compose.postgres.yml";

  /**
   * The pg Pool instance
   */
  protected knexClient!: KnexClient;

  /**
   * Constructor for PostgresAdapter
   * @param config The configuration object containing the uri and options for the PostgreSQL connection
   */
  constructor(connectionName: string, config: IKnexPostgresConfig) {
    super(connectionName, config);
  }

  /**
   * Returns the default Postgres credentials extracted from the docker-compose file
   * @returns {string | null} The default Postgres credentials
   */
  getDefaultCredentials(): string | null {
    const dockerComposeFilePath = this.getConfig().dockerComposeFilePath;

    if (!dockerComposeFilePath) {
      throw new Error("Docker compose file path is not set");
    }

    return extractDefaultPostgresCredentials(dockerComposeFilePath);
  }

  /**
   * Gets the KnexClient instance
   * @returns {KnexClient} The KnexClient instance
   */
  getKnexClient(): KnexClient {
    return this.knexClient;
  }

  /**
   * Connect to the PostgreSQL database
   *
   * Creates the default database if it does not exist
   * and sets up the Sequelize client
   *
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */

  async connectDefault(): Promise<void> {
    await this.createDefaultDatabase();

    // TODO: Create KnexClient
  }

  /**
   * Creates the default database if it does not exist
   * @returns {Promise<void>} A promise that resolves when the default database has been created
   * @throws {Error} If an error occurs while creating the default database
   * @private
   */
  async createDefaultDatabase(): Promise<void> {
    try {
      // TODO: Create default database
    } catch (err) {
      DB.getInstance().logger()?.error(err);
    } finally {
      
    }
  }

  /**
   * Check if the database connection is established
   * @returns {boolean} True if connected, false otherwise
   */
  async isConnected(): Promise<boolean> {
    return this.knexClient instanceof KnexClient;
  }

  /**
   * Gets the schema interface for the database
   * @returns {IDatabaseSchema} The schema interface
   */
  getSchema(): IDatabaseSchema {
    throw new Error("Method not implemented.");
  }

  /**
   * Retrieves the constructor for a Postgres query builder.
   *
   * @template Data The type of data to be queried, defaults to object.
   * @returns {TClassConstructor<IEloquent<Data>>} The constructor of the query builder.
   */
  getEloquentConstructor<Model extends IModel>(): TClassConstructor<
    IEloquent<Model>
  > {
    return KnexEloquent as unknown as TClassConstructor<IEloquent<Model>>;
  }

  /**
   * Creates the migrations schema for the database
   * @param tableName The name of the table to create
   * @returns A promise that resolves when the schema has been created
   */
  createMigrationSchema(tableName: string): Promise<unknown> {
    throw new Error("Method not implemented.");
    //return createMigrationSchemaPostgres(this, tableName);
  }



  /**
   * Get a new PostgreSQL client instance.
   *
   * @returns {pg.Client} A new instance of PostgreSQL client.
   */
  createKnexClient(config: Parameters<typeof KnexClient.createPostgresClient>[0]): KnexClient {
    return KnexClient.createPostgresClient(config);
  }

  /**
   * Get a new PostgreSQL client instance connected to a specific database.
   *
   * @param database - The name of the database to connect to. Defaults to 'postgres'
   * @returns {pg.Client} A new instance of PostgreSQL client.
   */
  createKnexClientWithDatabase(database: string = "postgres"): KnexClient {
    return KnexClient.createPostgresClient({
      ...this.getConfig(),
      database,
    });
  }

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
  async close(): Promise<void> {
    if (this.knexClient) {
      await this.knexClient.knex().destroy();
      this.knexClient = undefined as unknown as KnexClient;
    }
  }
}

export default KnexPostgresAdapter;

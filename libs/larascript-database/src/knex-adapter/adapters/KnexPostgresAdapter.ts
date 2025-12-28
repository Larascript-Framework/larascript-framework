import { extractDefaultPostgresCredentials, IPostgresConfig } from "@/postgres-adapter/index.js";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import pg from "pg";
import BaseDatabaseAdapter from "../../database/base/BaseDatabaseAdapter.js";
import { IDatabaseSchema } from "../../database/index.js";
import { IEloquent } from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import { IKnexPostgresAdapter } from "../contracts/adapter.js";
import { IKnexPostgresAdapterConfig } from "../contracts/config.js";
import KnexEloquent from "../eloquent/KnexEloquent.js";
import { KnexClient } from "../KnexClient.js";
import { createMigrationTable } from "../migrations/createMigrationTable.js";

/**
 * PostgresAdapter is responsible for managing the connection and operations with a PostgreSQL database.
 *
 * @class
 * @extends BaseDatabaseAdapter<IPostgresConfig>
 */
export class KnexPostgresAdapter extends BaseDatabaseAdapter<IKnexPostgresAdapterConfig> implements IKnexPostgresAdapter
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
  constructor(connectionName: string, config: IKnexPostgresAdapterConfig) {
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
    this.knexClient = this.createKnexClient({
      host: this.getConfig().connection.host,
      port: this.getConfig().connection.port,
      username: this.getConfig().connection.username,
      password: this.getConfig().connection.password,
      database: this.getConfig().connection.database,
    });
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
  async createMigrationSchema(tableName: string): Promise<unknown> {
    await createMigrationTable(this.getKnexClient().knex(), tableName);
    return Promise.resolve();
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

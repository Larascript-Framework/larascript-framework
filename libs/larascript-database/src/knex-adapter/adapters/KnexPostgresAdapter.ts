import { extractDefaultPostgresCredentials, IPostgresConfig } from "@/postgres-adapter/index.js";
import { Knex } from "knex";
import BaseDatabaseAdapter from "../../database/base/BaseDatabaseAdapter.js";
import { IEloquent } from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import { IKnexPostgresAdapter } from "../contracts/adapter.js";
import { IKnexPostgresAdapterConfig } from "../contracts/config.js";
import { IKnexSchema } from "../contracts/schema.js";
import KnexEloquent from "../eloquent/KnexEloquent.js";
import { KnexConnectionClientBuilder } from "../KnexConnectionClientBuilder.js";
import { createMigrationTable } from "../migrations/createMigrationTable.js";
import { KnexSchema } from "../schema/KnexSchema.js";

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
  protected knex!: Knex;

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
   * @returns {Knex} The Knex instance
   */
  getKnex(): Knex {
    return this.knex;
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
    this.knex = KnexConnectionClientBuilder.createPostgresClient({
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
    return typeof this.knex !== "undefined";
  }

  /**
   * Gets the schema interface for the database
   * @returns {IKnexSchema} The schema interface
   */
  getSchema(): IKnexSchema {
    return KnexSchema.create(this.getKnex());
  }

  createEloquentInstance<Model extends IModel = IModel>(): IEloquent<Model> {
    const knex = this.getKnex();

    if(typeof knex === "undefined") {
      throw new Error("Knex is not connected");
    }

    return KnexEloquent.create<Model>(knex) as unknown as IEloquent<Model>;
  }


  /**
   * Creates the migrations schema for the database
   * @param tableName The name of the table to create
   * @returns A promise that resolves when the schema has been created
   */
  async createMigrationSchema(tableName: string): Promise<unknown> {
    await createMigrationTable(this.getKnex(), tableName);
    return Promise.resolve();
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
    if (this.knex) {
      await this.knex.destroy();
      this.knex = undefined as unknown as Knex;
    }
  }

}

export default KnexPostgresAdapter;

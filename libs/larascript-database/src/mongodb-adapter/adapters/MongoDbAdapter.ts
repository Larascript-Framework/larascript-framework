import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { Db, MongoClient, MongoClientOptions, MongoServerError } from "mongodb";
import BaseDatabaseAdapter from "../../database/base/BaseDatabaseAdapter.js";
import CreateDatabaseException from "../../database/exceptions/CreateDatabaseException.js";
import { IDatabaseSchema } from "../../database/index.js";
import DB from "../../database/services/DB.js";
import { IEloquent, IRelationshipResolver } from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import MongoDbEloquent from "../eloquent/MongoDbEloquent.js";
import ParseMongoDBConnectionString from "../helper/ParseMongoDBConnectionUrl.js";
import { IMongoConfig, IMongoDbAdapter } from "../index.js";
import MongoRelationshipResolver from "../relationship/MongoRelationshipResolver.js";
import createMigrationSchemaMongo from "../schema/createMigrationSchemaMongo.js";
import MongoDbSchema from "../schema/MongoDbSchema.js";
import { extractDefaultMongoCredentials } from "../utils/extractDefaultMongoCredentials.js";

class MongoDbAdapter
  extends BaseDatabaseAdapter<IMongoConfig>
  implements IMongoDbAdapter
{
  _adapter_type_ = "mongodb";

  /**
   * The MongoDB database instance
   */
  protected db!: Db;

  /**
   * The MongoDB client instance
   */
  protected client!: MongoClient;

  /**
   * Constructor for PostgresAdapter
   * @param config The configuration object containing the uri and options for the PostgreSQL connection
   */
  constructor(connectionName: string, config: IMongoConfig) {
    super(connectionName, config);
  }

  /**
   * Normalize the primary key to _id
   */
  normalizeColumn(col: string): string {
    if (col === "id") {
      return "_id";
    }
    return col;
  }

  /**
   * Retrieves the name of the docker-compose file for MongoDB
   * @returns {string} The name of the docker-compose file
   */
  getDockerComposeFileName(): string {
    return "docker-compose.mongodb.yml";
  }

  /**
   * Returns the default MongoDB credentials extracted from the docker-compose file.
   *
   * @returns {string | null} The default MongoDB credentials, or null if they could not be extracted.
   */
  getDefaultCredentials(): string | null {
    const dockerComposeFilePath = this.getConfig().dockerComposeFilePath;

    if (!dockerComposeFilePath) {
      throw new Error("Docker compose file path is not set");
    }

    return extractDefaultMongoCredentials(dockerComposeFilePath);
  }

  /**
   * Gets the relationship resolver for the MongoDB adapter.
   * @returns {IRelationshipResolver} The relationship resolver.
   */
  getRelationshipResolver(): IRelationshipResolver {
    return new MongoRelationshipResolver(this.connectionName);
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error("MongoDB client is not connected");
    }
    return this.client;
  }

  /**
   * Get the MongoDB database instance
   * @returns {Db} The MongoDB database instance
   */
  getDb(): Db {
    if (!this.client) {
      throw new Error("MongoDB client is not connected");
    }
    return this.client.db();
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
    if (await this.isConnected()) {
      return;
    }

    await this.createDefaultDatabase();

    const { uri, options } = this.getConfig();

    this.client = new MongoClient(uri, options as MongoClientOptions);
    this.db = this.client.db();
  }

  /**
   * Connect to a specific PostgreSQL database.
   *
   * @param database - The name of the database to connect to.
   * @returns {Promise<MongoClient>} A promise that resolves with a new instance of PostgreSQL client.
   */
  async getMongoClientWithDatabase(
    database: string = "app",
    options: object = {},
  ): Promise<MongoClient> {
    const {
      host,
      port,
      username,
      password,
      options: mongoOptions,
    } = ParseMongoDBConnectionString.parse(this.getConfig().uri);

    const newCredentials = new ParseMongoDBConnectionString({
      host,
      port,
      username,
      password,
      database,
      options: mongoOptions,
    });

    const uri = newCredentials.toString();

    const client = new MongoClient(uri, options);

    try {
      await client.connect();
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error("Error connecting to database: " + (err as Error).message);

      if (err instanceof MongoServerError === false) {
        throw err;
      }
    }

    return client;
  }

  /**
   * Creates the default database if it does not exist
   * @returns {Promise<void>} A promise that resolves when the default database has been created
   * @throws {Error} If an error occurs while creating the default database
   * @private
   */
  private async createDefaultDatabase(): Promise<void> {
    try {
      const { database } = ParseMongoDBConnectionString.parse(
        this.getConfig().uri,
      );

      if (!database) {
        throw new CreateDatabaseException(
          "Database name not found in connection string",
        );
      }

      await this.getSchema().createDatabase(database);
    } catch (err) {
      DB.getInstance().logger()?.error(err);
    }
  }

  /**
   * Check if the database connection is established
   * @returns {boolean} True if connected, false otherwise
   */
  async isConnected(): Promise<boolean> {
    return this.db instanceof Db;
  }

  /**
   * Gets the schema interface for the database.
   *
   * @returns {IDatabaseSchema} The schema interface.
   */
  getSchema(): IDatabaseSchema {
    return new MongoDbSchema(this.connectionName);
  }

  getEloquentConstructor<Model extends IModel>(): TClassConstructor<
    IEloquent<Model>
  > {
    return MongoDbEloquent as unknown as TClassConstructor<IEloquent<Model>>;
  }

  createMigrationSchema(tableName: string): Promise<unknown> {
    return createMigrationSchemaMongo(this, tableName);
  }

  async close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default MongoDbAdapter;

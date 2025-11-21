import { IDatabaseAdapter, IDatabaseSchema } from "../interfaces/index.js";
import DB from "../services/DB.js";

abstract class BaseSchema<Adapter extends IDatabaseAdapter = IDatabaseAdapter>
  implements IDatabaseSchema
{
  /**
   * The name of the connection
   */
  protected connectionName: string;

  /**
   * @param connectionName
   */
  constructor(connectionName: string) {
    this.connectionName = connectionName;
  }

  /**
   * Gets the adapter for the given connection name.
   * @returns The adapter instance for the given connection.
   * @throws {Error} If the connection or adapter is not registered.
   */
  protected getAdapter(): Adapter {
    return DB.getInstance()
      .databaseService()
      .getAdapter(this.connectionName) as unknown as Adapter;
  }

  /**
   * Drops all tables in the database
   * @returns A promise that resolves when all tables have been dropped.
   */
  abstract dropAllTables(): Promise<void>;

  /**
   * Creates a new database schema.
   * If the database already exists, this method does nothing.
   * If the database does not exist, this method creates a new database schema.
   * @param name The name of the database
   * @returns A promise that resolves when the database schema has been created.
   */
  abstract createDatabase(name: string): Promise<void>;

  /**
   * Checks if a database exists
   * @param name The name of the database
   * @returns Promise resolving to boolean indicating if database exists
   */
  abstract databaseExists(name: string): Promise<boolean>;

  /**
   * Drops the database schema.
   * If the database does not exist, this method does nothing.
   * If the database exists, this method drops the database schema.
   * @param name The name of the database
   * @returns A promise that resolves when the database schema has been dropped.
   */
  abstract dropDatabase(name: string): Promise<void>;

  /**
   * Create a table in the database
   * @param name - Name of the table to create
   * @param args - Additional arguments for table creation
   * @returns Promise resolving when table is created
   */
  abstract createTable(name: string, ...args: any[]): Promise<void>;

  /**
   * Drop (delete) a table from the database
   * @param name - Name of the table to drop
   * @param args - Additional arguments for table deletion
   * @returns Promise resolving when table is dropped
   */
  abstract dropTable(name: string, ...args: any[]): Promise<void>;

  /**
   * Check if a table exists in the database
   * @param name - Name of the table to check
   * @returns Promise resolving to a boolean indicating whether the table exists
   */
  abstract tableExists(name: string): Promise<boolean>;

  /**
   * Alter a table in the database
   * @param name - Name of the table to alter
   * @param args - Additional arguments for table alteration
   * @returns Promise resolving when table is altered
   */
  abstract alterTable(name: string, ...args: any[]): Promise<void>;
}

export default BaseSchema;

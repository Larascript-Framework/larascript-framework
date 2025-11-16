import pg from "pg";
import {
  DataTypes,
  QueryInterfaceCreateTableOptions,
  QueryInterfaceDropTableOptions,
} from "sequelize";
import { ModelAttributes } from "sequelize/types/model";
import BaseSchema from "../database/base/BaseSchema.js";
import DB from "../database/services/DB.js";
import { PostgresAdapter } from "./adapters/index.js";
import { IAlterTableOptions } from "./index.js";

class PostgresSchema extends BaseSchema<PostgresAdapter> {
  /**
   * Creates a new database schema.
   * @param name The name of the database to create
   * @returns A promise that resolves when the database schema has been created
   */
  async createDatabase(name: string): Promise<void> {
    const client = await this.getAdapter().getPgClientWithDatabase("postgres");
    try {
      await client.connect();
      await client.query(`CREATE DATABASE ${name}`);
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(`Failed to create database ${name}: ${(err as Error).message}`);
      throw err;
    } finally {
      await client.end();
    }
  }

  /**
   * Checks if a database exists
   * @param name The name of the database to check
   * @returns A promise that resolves to a boolean indicating whether the database exists
   */
  async databaseExists(name: string): Promise<boolean> {
    const client = await this.getAdapter().getPgClientWithDatabase("postgres");
    try {
      await client.connect();
      const result = await client.query(
        `SELECT FROM pg_database WHERE datname = '${name}'`,
      );
      const dbExists =
        typeof result.rowCount === "number" && result.rowCount > 0;
      await client.end();
      return dbExists;
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(
          `Failed to check if database ${name} exists: ${(err as Error).message}`,
        );
      throw err;
    } finally {
      await client.end();
    }
  }

  /**
   * Terminates any remaining connections to a PostgreSQL database.
   * @param database The name of the database to terminate connections to.
   * @param client An optional pg.Client instance to use. If not provided, a new client will be created and closed after use.
   * @returns A promise that resolves when the connections have been terminated.
   */
  async terminateConnections(
    database: string,
    client?: pg.Client,
  ): Promise<void> {
    const endConnection: boolean = typeof client === "undefined";
    client =
      client ?? (await this.getAdapter().getPgClientWithDatabase(database));

    try {
      // Terminate any remaining connections to the target database
      await client.query(
        `
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity 
            WHERE pg_stat_activity.datname = $1
            AND pid <> pg_backend_pid()
            `,
        [database],
      );
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(
          `Failed to terminate connections to database ${database}: ${(err as Error).message}`,
        );
      throw err;
    } finally {
      if (endConnection) {
        await client.end();
      }
    }
  }

  /**
   * Drops the specified database.
   *
   * @param name - The name of the database to drop.
   * @returns A promise that resolves when the database has been dropped.
   */
  async dropDatabase(name: string): Promise<void> {
    const client = await this.getAdapter().getPgClientWithDatabase("postgres");

    try {
      await client.connect();

      // Terminate any remaining connections to the target database
      await this.terminateConnections(name, client);

      // Drop the database
      await client.query(`DROP DATABASE IF EXISTS "${name}"`);
    } catch (err) {
      throw new Error(
        `Failed to drop database ${name}: ${(err as Error).message}`,
      );
    } finally {
      // Clean up the pg client
      await client.end();
    }
  }

  /**
   * Ensure id property is added to attributes
   * @param attributes
   * @returns
   */
  protected withDefaultUuuidV4Schema(
    attributes: ModelAttributes,
  ): ModelAttributes {
    if (attributes["id"] === undefined) {
      return {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        ...attributes,
      };
    }

    return attributes;
  }

  /**
   * Create a table (id property is optional and is automatically added if not present)
   * @param tableName
   * @param attributes
   * @param optons
   */
  async createTable(
    tableName: string,
    attributes: ModelAttributes,
    optons?: QueryInterfaceCreateTableOptions,
  ): Promise<void> {
    try {
      const sequelize = await this.getAdapter().getSequelize();
      const queryInterface = sequelize.getQueryInterface();
      await queryInterface.createTable(
        tableName,
        this.withDefaultUuuidV4Schema(attributes),
        optons,
      );
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(
          `Failed to create table ${tableName}: ${(err as Error).message}`,
        );
      throw err;
    }
  }

  /**
   * Drop a table
   * @param tableName
   * @param options
   */
  async dropTable(
    tableName: string,
    options?: QueryInterfaceDropTableOptions,
  ): Promise<void> {
    try {
      const sequelize = await this.getAdapter().getSequelize();
      const queryInterface = sequelize.getQueryInterface();
      await queryInterface.dropTable(tableName, options);
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(`Failed to drop table ${tableName}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Alters a table
   * @param tableName
   * @param options
   */
  async alterTable(
    tableName: IAlterTableOptions["tableName"],
    options: Omit<IAlterTableOptions, "tableName">,
  ): Promise<void> {
    try {
      const sequelize = await this.getAdapter().getSequelize();

      if (options.addColumn) {
        await sequelize
          .getQueryInterface()
          .addColumn(
            tableName,
            options.addColumn.key,
            options.addColumn.attribute,
            options.addColumn.options,
          );
      }
      if (options.removeColumn) {
        await sequelize
          .getQueryInterface()
          .removeColumn(
            tableName,
            options.removeColumn.attribute,
            options.removeColumn.options,
          );
      }
      if (options.changeColumn) {
        await sequelize
          .getQueryInterface()
          .changeColumn(
            tableName,
            options.changeColumn.attributeName,
            options.changeColumn.dataTypeOrOptions,
            options.changeColumn.options,
          );
      }
      if (options.renameColumn) {
        await sequelize
          .getQueryInterface()
          .renameColumn(
            tableName,
            options.renameColumn.attrNameBefore,
            options.renameColumn.attrNameAfter,
            options.renameColumn.options,
          );
      }
      if (options.addIndex) {
        await sequelize
          .getQueryInterface()
          .addIndex(
            tableName,
            options.addIndex.attributes,
            options.addIndex.options,
          );
      }
      if (options.removeIndex) {
        await sequelize
          .getQueryInterface()
          .removeIndex(
            tableName,
            options.removeIndex.indexName,
            options.removeIndex.options,
          );
      }
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(
          `Failed to alter table ${tableName}: ${(err as Error).message}`,
        );
      throw err;
    }
  }

  /**
   * Check if table exists
   * @param tableName
   * @returns
   */
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const sequelize = await this.getAdapter().getSequelize();
      const queryInterface = sequelize.getQueryInterface();
      return await queryInterface.tableExists(tableName);
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(
          `Failed to check if table ${tableName} exists: ${(err as Error).message}`,
        );
      throw err;
    }
  }

  /**
   * Drop all tables in the database
   */
  async dropAllTables(): Promise<void> {
    try {
      const sequelize = await this.getAdapter().getSequelize();
      const queryInterface = sequelize.getQueryInterface();
      await queryInterface.dropAllTables();
    } catch (err) {
      DB.getInstance()
        .logger()
        ?.error(`Failed to drop all tables: ${(err as Error).message}`);
      throw err;
    }
  }
}

export default PostgresSchema;

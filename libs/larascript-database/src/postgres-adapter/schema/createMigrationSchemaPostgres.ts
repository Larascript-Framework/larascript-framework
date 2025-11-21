import { DataTypes } from "sequelize";
import PostgresAdapter from "../adapters/PostgresAdapter.js";

/**
 * Creates the migrations table in Postgres if it does not already exist
 *
 * @returns {Promise<void>}
 */
const createMigrationSchemaPostgres = async (
  adapter: PostgresAdapter,
  tableName: string = "migrations",
) => {
  const sequelize = await adapter.getSequelize();
  const queryInterface = sequelize.getQueryInterface();

  if ((await queryInterface.showAllTables())?.includes(tableName)) {
    return;
  }

  await queryInterface.createTable(tableName, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: "VARCHAR",
      allowNull: false,
    },
    batch: {
      type: "INT",
      allowNull: false,
    },
    checksum: {
      type: "VARCHAR",
      allowNull: false,
    },
    type: {
      type: "VARCHAR",
      allowNull: false,
    },
    appliedAt: {
      type: "TIMESTAMPTZ",
      allowNull: false,
    },
  });
};

export default createMigrationSchemaPostgres;

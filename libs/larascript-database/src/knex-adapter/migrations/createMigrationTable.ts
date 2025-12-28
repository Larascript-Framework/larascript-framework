import { Knex } from "knex";

export const createMigrationTable = async (knex: Knex, tableName: string = "migrations") => {
  await knex.schema.createTable(tableName, (table) => {
    table.increments("id");
    table.string("name");
    table.string("batch");
    table.string("checksum");
    table.string("type");
    table.timestamp("appliedAt");
  });
};
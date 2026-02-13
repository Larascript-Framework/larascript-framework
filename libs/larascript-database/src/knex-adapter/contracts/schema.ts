import { IDatabaseSchema } from "@/database/index.js";
import { Knex } from "knex";

export interface IKnexSchema extends IDatabaseSchema {
createDatabase(name: string): Promise<void>;
  databaseExists(name: string): Promise<boolean>;
  dropDatabase(name: string): Promise<void>;
  createTable(name: string, callback: (table: Knex.CreateTableBuilder) => void): Promise<void>;
  dropTable(name: string): Promise<void>;
  tableExists(name: string): Promise<boolean>;
  alterTable(name: string, callback: (table: Knex.AlterTableBuilder) => void): Promise<void>;
  dropAllTables(): Promise<void>;
}
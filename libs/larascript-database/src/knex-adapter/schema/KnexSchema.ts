import { Knex } from "knex";
import { IKnexSchema } from "../contracts/schema.js";

export class KnexSchema implements IKnexSchema {
  private constructor(private knex: Knex) {}

  static create(knex: Knex): KnexSchema {
    return new KnexSchema(knex);
  }

  async createDatabase(name: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async databaseExists(name: string): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async dropDatabase(name: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async createTable(name: string, callback: (table: Knex.CreateTableBuilder) => void): Promise<void> {
    await this.knex.schema.createTable(name, callback);
  }

  async dropTable(name: string): Promise<void> {
    await this.knex.schema.dropTable(name);
  }

  async tableExists(name: string): Promise<boolean> {
    return await this.knex.schema.hasTable(name);
  }

  async alterTable(name: string, callback: (table: Knex.AlterTableBuilder) => void): Promise<void> {
    await this.knex.schema.alterTable(name, callback);
  }

  async dropAllTables(): Promise<void> {
    throw new Error("Not implemented");
  }
}
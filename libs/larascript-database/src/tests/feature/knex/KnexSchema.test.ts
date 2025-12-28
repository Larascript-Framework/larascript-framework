import DB from "@/database/services/DB.js";
import KnexPostgresAdapter from "@/knex-adapter/adapters/KnexPostgresAdapter.js";
import { IKnexSchema } from "@/knex-adapter/contracts/schema.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe, test } from "@jest/globals";

describe("Knex Eloquent", () => {
  let adapter: KnexPostgresAdapter;
  let schema: IKnexSchema;

  beforeAll(async () => {
    await testHelper.testBootApp();
    adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
    await adapter.connectDefault();
    schema = DB.getInstance().databaseService().schema("knex_postgres");
  });
  
  afterAll(async () => {
    await adapter.close();
  });

  describe("Invalid Database Operations", () => {
    test("should not be able create a database", async () => {
      await expect(schema.createDatabase("invalid_database")).rejects.toThrow("Not implemented");
    });

    test("should not be able to check if a database exists", async () => {
      await expect(schema.databaseExists("invalid_database")).rejects.toThrow("Not implemented");
    });

    test("should not be able to drop a database", async () => {
      await expect(schema.dropDatabase("invalid_database")).rejects.toThrow("Not implemented");
    });
  });

  describe("Table Operations", () => {
    let tableName: string;

    beforeAll(async () => {
      tableName = "test_table_" + Math.random().toString(36).substring(2, 15);
    });

    afterAll(async () => {
      await schema.dropTable(tableName);
    });

    test("should be able to create a table, check if it exists, and drop it", async () => {
      await schema.createTable(tableName, (table) => {
        table.increments("id");
        table.string("name");
      });

      let tableExists = await schema.tableExists(tableName);
      expect(tableExists).toBe(true);

      await schema.dropTable(tableName);

      tableExists = await schema.tableExists(tableName);
      expect(tableExists).toBe(false);
    });

    test("should be able to alter a table", async () => {

      await schema.createTable(tableName, (table) => {
        table.increments("id");
        table.string("name");
      });

      await adapter.getKnex().table(tableName).insert({
        name: "John Doe",
      });

      const insertedResult = await adapter.getKnex().table(tableName).select();
      expect(insertedResult).toHaveLength(1);
      expect(insertedResult[0].name).toBe("John Doe");

      await schema.alterTable(tableName, (table) => {
        table.string("email");
      });

      let tableExists = await schema.tableExists(tableName);
      expect(tableExists).toBe(true);

      await adapter.getKnex().table(tableName)
        .where("name", "John Doe")
        .update({
          email: "john.doe@example.com",
        });

      const updatedResult = await adapter.getKnex().table(tableName).where("email", "john.doe@example.com").select();
      expect(updatedResult).toHaveLength(1);
      expect(updatedResult[0].name).toBe("John Doe");
      expect(updatedResult[0].email).toBe("john.doe@example.com");
    });
  });
});

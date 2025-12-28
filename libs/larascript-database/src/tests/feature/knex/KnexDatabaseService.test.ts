import DB from "@/database/services/DB.js";
import KnexEloquent from "@/knex-adapter/eloquent/KnexEloquent.js";
import { extractDefaultPostgresCredentials } from "@/postgres-adapter/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import path from "path";
import { KnexPostgresAdapter } from "../../../knex-adapter/adapters/KnexPostgresAdapter.js";
import { testHelper } from "../../../tests/tests-helper/testHelper.js";
import TestModel from "../model/models/TestModel.js";

describe("Knex Database Service", () => {

  describe("Adapter", () => {
    let adapter: KnexPostgresAdapter;
    
    beforeAll(async () => {
      await testHelper.testBootApp(); 
    });

    afterAll(async () => {
      adapter.close();
    });

    beforeEach(async () => {
      adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
    });


    test("should be able to get the adapter", () => {
      expect(adapter).toBeInstanceOf(KnexPostgresAdapter);
    })

    test("should be able to get the default credentials", () => {
      const defaultUri = adapter.getDefaultCredentials();

      const uri = extractDefaultPostgresCredentials(path.resolve(process.cwd(), "../../libs/larascript-database/docker/docker-compose.postgres.yml"));

      expect(defaultUri).toBe(uri);
    })

  });

  describe("Connect Default", () => {
    let adapter: KnexPostgresAdapter;

    beforeEach(async () => {
      adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
      await adapter.connectDefault();
    });

    afterEach(async () => {
      await adapter.close();
    });

    test("should be able to get the knex after running connectDefault", async () => {
      expect(adapter.getKnex()).toBeDefined();
    })

    test("should be able to create a table after running connectDefault", async () => {

      const knex = adapter.getKnex();
      const tableName = "test_table" + Math.random().toString(36).substring(2, 15);

      let tableExists = await knex.schema.hasTable(tableName);

      if(tableExists) {
        await knex.schema.dropTable(tableName);
      }

      await knex.schema.createTable(tableName, (table) => {
        table.increments("id");
        table.string("name");
      });

      tableExists = await knex.schema.hasTable("test_table");
      expect(tableExists).toBe(true);

      await knex.schema.dropTable(tableName);
    })

    test("isConnected should return true after running connectDefault", async () => {
      expect(await adapter.isConnected()).toBe(true);
    })

    test("close should close the knex client", async () => {
      await adapter.close();
      const isConnected = await adapter.isConnected();

      expect(isConnected).toBe(false);
      expect(adapter.getKnex()).toBeUndefined();
    })
  })

  describe("EloquentConstructor", () => {
    let adapter: KnexPostgresAdapter;

    beforeEach(async () => {
      adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
    });
    
    test("should be able to get the eloquent constructor", () => {
      const eloquentConstructor = adapter.getEloquentConstructor<TestModel>();
      
      expect(eloquentConstructor).toBeDefined();
      const eloquent = new eloquentConstructor()

      expect(eloquent).toBeInstanceOf(KnexEloquent);
    })
  })

  describe("Create Migration Schema", () => {
    let adapter: KnexPostgresAdapter;

    beforeEach(async () => {
      adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
      await adapter.connectDefault();
    });

    afterEach(async () => {
      await adapter.close();
    });

    test("should be able to create a migration schema", async () => {
      const tableName = "test_migration_schema" + Math.random().toString(36).substring(2, 15);

      await adapter.createMigrationSchema(tableName);

      const tableExists = await adapter.getKnex().schema.hasTable(tableName);
      expect(tableExists).toBe(true);

      await adapter.getKnex().schema.dropTable(tableName);
    });
  })

});

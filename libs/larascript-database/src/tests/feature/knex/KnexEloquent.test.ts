import DB from "@/database/services/DB.js";
import { IEloquent, IEloquentQueryBuilderService } from "@/eloquent/index.js";
import KnexPostgresAdapter from "@/knex-adapter/adapters/KnexPostgresAdapter.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe, expect, test } from "@jest/globals";
import { resetTestPersonTable, TestPerson } from "./models/TestPerson.js";

describe("Knex Eloquent", () => {
  let adapter: KnexPostgresAdapter;
  let eloquentService: IEloquentQueryBuilderService;
  let createQuery: () => IEloquent<TestPerson>;

  beforeAll(async () => {
    await testHelper.testBootApp();
    adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
    eloquentService = DB.getInstance().queryBuilderService();
    await adapter.connectDefault();
    createQuery = () => eloquentService.builder(TestPerson, "knex_postgres");
  });

  beforeEach(async () => {
    await resetTestPersonTable(adapter.getKnex());
  });
  
  afterAll(async () => {
    await adapter.close();
  });

  describe("Insert", () => {
    test("should be able to insert a record", async () => {
      const query = createQuery();
      
      const result = await query.insert([
        {
          name: 'John',
          age: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      
      expect(result.count()).toBe(1);
      expect(result.get(0)?.id).toBeDefined();
      expect(result.get(0)?.name).toBe("John");
      expect(result.get(0)?.age).toBe(30);
      expect(result.get(0)?.createdAt).toBeDefined();
      expect(result.get(0)?.updatedAt).toBeDefined();
    })

    test("should be able to insert multiple records", async () => {
      const query = createQuery();
      
      const result = await query.insert([
        {
          name: 'John',
          age: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Jane',
          age: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);

      expect(result.count()).toBe(2);
      expect(result.get(0)?.id).toBeDefined();
      expect(result.get(0)?.name).toBe("John");
      expect(result.get(0)?.age).toBe(30);
      expect(result.get(0)?.createdAt).toBeDefined();
      expect(result.get(0)?.updatedAt).toBeDefined();
      expect(result.get(1)?.id).toBeDefined();
      expect(result.get(1)?.name).toBe("Jane");
      expect(result.get(1)?.age).toBe(30);
      expect(result.get(1)?.createdAt).toBeDefined();
      expect(result.get(1)?.updatedAt).toBeDefined();
    })
  });
});

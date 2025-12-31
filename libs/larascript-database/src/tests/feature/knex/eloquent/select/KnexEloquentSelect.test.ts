import DB from "@/database/services/DB.js";
import { IEloquent, IEloquentQueryBuilderService } from "@/eloquent/index.js";
import KnexPostgresAdapter from "@/knex-adapter/adapters/KnexPostgresAdapter.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe, expect, test } from "@jest/globals";
import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { resetTestSelectModel, TestSelectModel } from "./TestSelectModel.js";

const firstName = "Benjamin";
const firstAge = 30;
const firstSkills = ["reading", "writing", "math"];

const secondName = "Alice";
const secondAge = 40;
const secondSkills = ["science", "history", "geography"];

const thirdName = "Charlie";
const thirdAge = 50;
const thirdSkills = ["art", "music", "dance"];

const fourthName = "David";
const fourthAge = 60;
const fourthSkills = ["sports", "games", "recreation"];

describe("Knex Eloquent", () => {
  let adapter: KnexPostgresAdapter;
  let eloquentService: IEloquentQueryBuilderService;
  let createQuery: () => IEloquent<TestSelectModel>;

  beforeAll(async () => {
    await testHelper.testBootApp();
    adapter = DB.getInstance().databaseService().getAdapter("knex_postgres") as KnexPostgresAdapter;
    eloquentService = DB.getInstance().queryBuilderService();
    await adapter.connectDefault();
    createQuery = () => eloquentService.builder(TestSelectModel, "knex_postgres");
  });

  beforeEach(async () => {
    await resetTestSelectModel(adapter.getKnex());

    await adapter.getKnex().insert([
      {
        id: generateUuidV4(),
        name: firstName,
        age: firstAge,
        skills: JSON.stringify(firstSkills),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateUuidV4(),
        name: secondName,
        age: secondAge,
        skills: JSON.stringify(secondSkills),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateUuidV4(),
        name: thirdName,
        age: thirdAge,
        skills: JSON.stringify(thirdSkills),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: generateUuidV4(),
        name: fourthName,
        age: fourthAge,
        skills: JSON.stringify(fourthSkills),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]).into(TestSelectModel.getTable());
  });

  afterAll(async () => {
    await adapter.close();
  });

  describe("Selection", () => {
    test("should be able to select all records", async () => {
      const query = createQuery();

      const results = await query.get();

      expect(results.count()).toBe(4);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);

      expect(results.get(1)?.name).toBe(secondName);
      expect(results.get(1)?.age).toBe(secondAge);

      expect(results.get(2)?.name).toBe(thirdName);
      expect(results.get(2)?.age).toBe(thirdAge);

      expect(results.get(3)?.name).toBe(fourthName);
      expect(results.get(3)?.age).toBe(fourthAge);
    })

    test("should be able to select all records with a single column", async () => {
      const query = createQuery();

      const results = await query.select(["name"]).get();

      expect(results.count()).toBe(4);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBeNull();
    })

    test("should be able to select all records with multiple columns", async () => {
      const query = createQuery();

      const results = await query.select(["name", "age"]).get();

      expect(results.count()).toBe(4);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);
      expect(results.get(0)?.skills).toBeNull();
    })

  });

  describe("Offset/Limit", () => {
    test("should be able to limit the results", async () => {

      const query = createQuery();

      const results = await query.limit(2).get();

      expect(results.count()).toBe(2);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);
      expect(results.get(1)?.name).toBe(secondName);
      expect(results.get(1)?.age).toBe(secondAge);
    })

    test("should be able to offset the results", async () => {
      
      const query = createQuery();

      const results = await query.offset(2).get();

      expect(results.count()).toBe(2);

      expect(results.get(0)?.name).toBe(thirdName);
      expect(results.get(0)?.age).toBe(thirdAge);
      expect(results.get(1)?.name).toBe(fourthName);
      expect(results.get(1)?.age).toBe(fourthAge);
    })

    test("should be able to limit and offset the results", async () => {

      const query = createQuery();

      const results = await query.limit(1).offset(2).get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.name).toBe(thirdName);
      expect(results.get(0)?.age).toBe(thirdAge);
    })
  });

});

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

  describe("Ordering", () => {
    test("should be able to order by ascending", async () => {
      const query = createQuery();

      const results = await query.orderBy("name", "asc").get();

      const expectedOrder = [
        secondName, // Alice
        firstName, // Benjamin
        thirdName, // Charlie
        fourthName, // David
      ]

      expect(results.count()).toBe(4);
      expect(results.get(0)?.name).toBe(expectedOrder[0]);
      expect(results.get(1)?.name).toBe(expectedOrder[1]);
      expect(results.get(2)?.name).toBe(expectedOrder[2]);
      expect(results.get(3)?.name).toBe(expectedOrder[3]);
    });

    test("should be able to order by descending", async () => {
      const query = createQuery();

      const results = await query.orderBy("name", "desc").get();

      const expectedOrder = [
        fourthName, // David
        thirdName, // Charlie
        firstName, // Benjamin
        secondName, // Alice
      ]

      expect(results.count()).toBe(4);
      expect(results.get(0)?.name).toBe(expectedOrder[0]);
      expect(results.get(1)?.name).toBe(expectedOrder[1]);
      expect(results.get(2)?.name).toBe(expectedOrder[2]);
      expect(results.get(3)?.name).toBe(expectedOrder[3]);
    });

    test("should be able to order by name descending and age ascending", async () => {

      const query = createQuery();

      // Insert a record with the same name as Benjamin but a different age
      // This record should appear after Benjamin in the order by name descending and age ascending
      await adapter.getKnex().insert([
        {
          id: generateUuidV4(),
          name: "Benjamin",
          age: 100,
          skills: JSON.stringify(firstSkills),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]).into(TestSelectModel.getTable());

      const results = await query.orderBy("name", "desc").orderBy("age", "asc").get();

      const expectedOrder: { name: string, age: number }[] = [
        { name: fourthName, age: fourthAge }, // David, 60
        { name: thirdName, age: thirdAge }, // Charlie, 50
        { name: firstName, age: firstAge }, // Benjamin, 30
        { name: "Benjamin", age: 100 }, // Benjamin, 100
        { name: secondName, age: secondAge }, // Alice, 40
      ]

      expect(results.count()).toBe(5);
      expect(results.get(0)?.name).toBe(expectedOrder[0].name); // David, 60
      expect(results.get(0)?.age).toBe(expectedOrder[0].age);

      expect(results.get(1)?.name).toBe(expectedOrder[1].name); // Charlie, 50
      expect(results.get(1)?.age).toBe(expectedOrder[1].age);

      expect(results.get(2)?.name).toBe(expectedOrder[2].name); // Benjamin, 30
      expect(results.get(2)?.age).toBe(expectedOrder[2].age);

      expect(results.get(3)?.name).toBe(expectedOrder[3].name); // Benjamin, 100
      expect(results.get(3)?.age).toBe(expectedOrder[3].age);

      expect(results.get(4)?.name).toBe(expectedOrder[4].name); // Alice, 40
      expect(results.get(4)?.age).toBe(expectedOrder[4].age);
    });

    test("should be able to order by name age descending and name ascending", async () => {

      const query = createQuery();

      // Insert a record with the same name as Benjamin but a different age
      // This record should appear after Benjamin in the order by name descending and age ascending
      await adapter.getKnex().insert([
        {
          id: generateUuidV4(),
          name: "Benjamin",
          age: 0,
          skills: JSON.stringify(firstSkills),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]).into(TestSelectModel.getTable());

      const results = await query.orderBy("age", "desc").orderBy("name", "asc").get();

      const expectedOrder: { name: string, age: number }[] = [
        { name: fourthName, age: fourthAge }, // David, 60
        { name: thirdName, age: thirdAge }, // Charlie, 50
        { name: secondName, age: secondAge }, // Alice, 40
        { name: firstName, age: firstAge }, // Benjamin, 30
        { name: "Benjamin", age: 0 }, // Benjamin, 0
      ]

      expect(results.count()).toBe(5);

      expect(results.get(0)?.name).toBe(expectedOrder[0].name); // David, 60
      expect(results.get(0)?.age).toBe(expectedOrder[0].age);

      expect(results.get(1)?.name).toBe(expectedOrder[1].name); // Charlie, 50
      expect(results.get(1)?.age).toBe(expectedOrder[1].age);

      expect(results.get(2)?.name).toBe(expectedOrder[2].name); // Alice, 40
      expect(results.get(2)?.age).toBe(expectedOrder[2].age);

      expect(results.get(3)?.name).toBe(expectedOrder[3].name); // Benjamin, 30
      expect(results.get(3)?.age).toBe(expectedOrder[3].age);

      expect(results.get(4)?.name).toBe(expectedOrder[4].name); // Benjamin, 0
      expect(results.get(4)?.age).toBe(expectedOrder[4].age);
    });

  })
});

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

  describe("Single Where Clauses", () => {
    test("should be able to use the equals operator", async () => {

      const query = createQuery();

      const results = await query.where("name", firstName).get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);
    })

    test("should be able to use the not equals operator", async () => {

      const query = createQuery();

      const results = await query.where("name", "!=", secondName).get();

      expect(results.count()).toBe(3);
    })

    test("should be able to use the greater than operator", async () => {

      const query = createQuery();

      const results = await query.where("age", ">", thirdAge).get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.name).toBe(fourthName);
      expect(results.get(0)?.age).toBe(fourthAge);
    })

    test("should be able to use the greater than or equal to operator", async () => {

      const query = createQuery();

      const results = await query.where("age", ">=", thirdAge).get();

      const expectedAllAgesAboveThirdAge = results.filter(result => result.age >= thirdAge).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedAllAgesAboveThirdAge).toBe(true);
    })

    test("should be able to use the less than operator", async () => {

      const query = createQuery();

      const results = await query.where("age", "<", thirdAge).get();

      const expectedAllAgesBelowThirdAge = results.filter(result => result.age < thirdAge).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedAllAgesBelowThirdAge).toBe(true);
    })

    test("should be able to use the less than or equal to operator", async () => {

      const query = createQuery();

      const results = await query.where("age", "<=", thirdAge).get();

      const expectedAllAgesBelowOrEqualThirdAge = results.filter(result => result.age <= thirdAge).count() > 0;

      expect(results.count()).toBe(3);
      expect(expectedAllAgesBelowOrEqualThirdAge).toBe(true);
    })

    test("should be able to use the like operator", async () => {

      const query = createQuery();

      const results = await query.where("name", "like", `%${firstName}%`).get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);
    })

    test("should be able to use the like operator with partial match", async () => {

      const query = createQuery();

      const results = await query.where("name", "like", `%${firstName.substring(0, 3)}%`).get();

      const expectedAllNamesWithPartialMatch = results.filter(result => result.name.includes(firstName.substring(0, 3))).count() > 0;

      expect(results.count()).toBe(1);
      expect(expectedAllNamesWithPartialMatch).toBe(true);
    })

    test("should be able to use the not like operator", async () => {

      const query = createQuery();

      const results = await query.where("name", "not like", `%${firstName}%`).get();

      const expectedAllNamesNotWithPartialMatch = results.filter(result => !result.name.includes(firstName)).count() > 0;

      expect(results.count()).toBe(3);
      expect(expectedAllNamesNotWithPartialMatch).toBe(true);
    })
  });

  describe("Multiple Where Clauses", () => {
    
    test("should be able to use multiple equal operators with an and condition", async () => {

      const query = createQuery();

      const results = await query.where("name", firstName)
        .where("age", "=", firstAge).get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.name).toBe(firstName);
      expect(results.get(0)?.age).toBe(firstAge);
    })

    test("should be able to use multiple equal operators with an or condition", async () => {

      const query = createQuery();

      const results = await query.where("name", firstName)
        .orWhere("age", "=", secondAge).get();

        const expectedSomeNamesAreEqualFirstNameAndSomeAgesAreEqualSecondAge = results.filter(
          result => result.name === firstName || result.age === secondAge
        ).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedSomeNamesAreEqualFirstNameAndSomeAgesAreEqualSecondAge).toBe(true);
    })

    test("should be able to use multiple not equal operators", async () => {

      const query = createQuery();

      const results = await query
        .where("name", "!=", secondName)
        .where("age", "!=", thirdAge).get();

      const expectedSomeNamesNotEqualSecondNameAndThirdName = results.filter(
        result => result.name !== secondName && result.name !== thirdName
      ).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedSomeNamesNotEqualSecondNameAndThirdName).toBe(true);
    })
  });

  describe("Where In and Where Not In", () => {

    test("should be able to use where in", async () => {

      const query = createQuery();

      const results = await query.whereIn("age", [secondAge, thirdAge]).get();

      const expectedSomeAgesAreSecondAgeOrThirdAge = results.filter(
        result => result.age === secondAge || result.age === thirdAge
      ).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedSomeAgesAreSecondAgeOrThirdAge).toBe(true);
    });

    test("should be able to use where not in", async () => {

      const query = createQuery();

      const results = await query.whereNotIn("age", [secondAge, thirdAge]).get();

      const expectedSomeAgesAreNotSecondAgeOrThirdAge = results.filter(
        result => result.age !== secondAge && result.age !== thirdAge
      ).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedSomeAgesAreNotSecondAgeOrThirdAge).toBe(true);
    })

    test("should be able to use where in and where not in", async () => {

      const query = createQuery();

      const results = await query.whereIn("name", [firstName, secondName])
        .whereNotIn("name", [thirdName, fourthName]).get();

      const expectedSomeNamesAreFirstNameOrSecondName = results.filter(
        result => {
          const truthy = result.name === firstName || result.name === secondName;
          const falsy = result.name !== thirdName && result.name !== fourthName;
          return truthy && falsy;
        }
      ).count() > 0;

      expect(results.count()).toBe(2);
      expect(expectedSomeNamesAreFirstNameOrSecondName).toBe(true);
    })

  });

  describe("Where Null and Where Not Null", () => {
    let nullNameId: string;

    beforeEach(async () => {
      nullNameId = generateUuidV4();
      
      await adapter.getKnex().insert([
        {
          id: nullNameId,
          name: null,
          age: 1000,
          skills: JSON.stringify(firstSkills),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]).into(TestSelectModel.getTable());
    });

    test("should be able to use where null", async () => {

      const query = createQuery();

      const results = await query.whereNull("name").get();

      expect(results.count()).toBe(1);
      expect(results.get(0)?.id).toBe(nullNameId);
    })

    test.only("should be able to use where not null", async () => {

      const query = createQuery();

      const results = await query.whereNotNull("name").get();

      const expectedAllNamesAreNotNull = results.filter(result => result.name !== null).count() > 0;

      expect(results.count()).toBe(4);
      expect(expectedAllNamesAreNotNull).toBe(true);
    })
  })
});

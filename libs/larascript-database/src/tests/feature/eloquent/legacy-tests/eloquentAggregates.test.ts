import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

describe("eloquent", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();

    await resetPeopleTable();

    await forEveryConnection(async (connection) => {
      await queryBuilder(TestPeopleModel, connection).insert([
        {
          name: "Alice",
          age: 25,
          religion: "Islam",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bob",
          age: 30,
          religion: "Christian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "John",
          age: 35,
          religion: "Christian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jane",
          age: 45,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });
  });

  test("test count", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const results = await query.clone().count();
      expect(results).toBe(4);

      const resultsOver30 = await query.clone().where("age", ">", 30).count();
      expect(resultsOver30).toBe(2);

      const resultsUnder30 = await query.clone().where("age", "<", 30).count();
      expect(resultsUnder30).toBe(1);

      const resultsBetween30And40 = await query
        .clone()
        .where("age", ">=", 30)
        .where("age", "<=", 40)
        .count();
      expect(resultsBetween30And40).toBe(2);

      const resultsChristian = await query.clone().count("religion");
      expect(resultsChristian).toBe(3);
    });
  });

  test("test avg", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const results = await query.clone().avg("age");
      expect(results).toBe(33.75);

      const resultsOver30 = await query
        .clone()
        .where("age", ">", 30)
        .avg("age");
      expect(resultsOver30).toBe(40);

      const resultsUnder30 = await query
        .clone()
        .where("age", "<", 30)
        .avg("age");
      expect(resultsUnder30).toBe(25);
    });
  });

  test("test sum", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const results = await query.clone().sum("age");
      expect(results).toBe(135);

      const resultsOver30 = await query
        .clone()
        .where("age", ">", 30)
        .sum("age");
      expect(resultsOver30).toBe(80);
    });
  });

  test("test min", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const results = await query.clone().min("age");
      expect(results).toBe(25);
    });
  });

  test("test max", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const results = await query.clone().max("age");
      expect(results).toBe(45);
    });
  });
});

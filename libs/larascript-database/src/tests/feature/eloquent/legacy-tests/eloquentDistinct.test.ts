import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

const resetAndRepopulate = async () => {
  await resetPeopleTable();

  await forEveryConnection(async (connection) => {
    await queryBuilder(TestPeopleModel, connection).insert([
      {
        name: "John",
        age: 20,
        religion: "Islam",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jane",
        age: 20,
        religion: "Christian",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bob",
        age: 30,
        religion: "Islam",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Alice",
        age: 30,
        religion: "Jewish",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });
};

describe("eloquent", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
    await resetAndRepopulate();
  });

  test("test group by", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);
      const results = await query.clone().distinct("name").get();
      expect(results.count()).toBe(4);
      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Bob");
      expect(results[2].name).toBe("Jane");
      expect(results[3].name).toBe("John");

      const resultChristians = await query
        .clone()
        .where("religion", "Christian")
        .distinct("name")
        .get();
      expect(resultChristians.count()).toBe(1);
      expect(resultChristians[0].name).toBe("Jane");

      const resultMuslims = await query
        .clone()
        .where("religion", "Islam")
        .distinct("name")
        .get();
      expect(resultMuslims.count()).toBe(2);
      expect(resultMuslims[0].name).toBe("Bob");
      expect(resultMuslims[1].name).toBe("John");

      const resultJewish = await query
        .clone()
        .where("religion", "Jewish")
        .distinct("name")
        .get();
      expect(resultJewish.count()).toBe(1);
      expect(resultJewish[0].name).toBe("Alice");
    });
  });
});

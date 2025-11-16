import { describe } from "@jest/globals";
import { forEveryConnection } from "../tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "../tests-helper/testHelper.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

describe("eloquent", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
    await resetPeopleTable();
  });

  test("test insert records", async () => {
    await forEveryConnection(async (connection) => {
      const results = await queryBuilder(TestPeopleModel, connection).insert([
        {
          name: "John",
          age: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jane",
          age: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      expect(results.count()).toBe(2);

      expect(typeof results.get(0)?.id === "string").toBeTruthy();
      expect(results.get(0)?.name).toBe("John");
      expect(results.get(0)?.age).toBe(25);

      expect(typeof results.get(1)?.id === "string").toBeTruthy();
      expect(results.get(1)?.name).toBe("Jane");
      expect(results.get(1)?.age).toBe(30);
    });
  });
});

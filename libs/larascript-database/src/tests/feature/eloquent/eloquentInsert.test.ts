import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentConnectionTest, IEloquentConnectionTestCallback } from "./abstractions/EloquentConnectionTest.js";
import TestPeopleModel, { resetPeopleTable } from "./legacy-tests/models/TestPeopleModel.js";

describe("eloquent", () => {
  let execTest: IEloquentConnectionTestCallback;
  
  beforeAll(async () => {
    await testHelper.testBootApp();
    await resetPeopleTable();
  });

  describe("test insert records", () => {
    execTest = async (eloquentTest: EloquentConnectionTest) => {{
      const results = await eloquentTest.queryBuilder(TestPeopleModel).insert([
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
    }}
    
    test("test insert records for postgres", async () => {
      await execTest(EloquentConnectionTest.create("postgres"));
    });

    test("test insert records for mongodb", async () => {
      await execTest(EloquentConnectionTest.create("mongodb"));
    });

  });
});

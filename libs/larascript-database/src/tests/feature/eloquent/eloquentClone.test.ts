import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

describe("eloquent", () => {
  let postgres: EloquentContext;
  let mongodb: EloquentContext;

  beforeAll(async () => {
    postgres = EloquentContext.create("postgres");
    mongodb = EloquentContext.create("mongodb");
    await testHelper.testBootApp();
  });

  beforeEach(async () => {
    await resetPeopleTable();
  });

  describe("test clone query", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel);

      const inserted = await query.clone().insert([
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

      const restrictedQuery = query.clone().where("age", "=", 25);
      const restrictedResult = await restrictedQuery.first();
      expect(restrictedResult?.id).toBe(inserted[0].id);
      expect(restrictedResult?.name).toBe("John");

      console.log("restricted expression", restrictedQuery.getExpression());

      const everythingQuery = query.clone();
      const everythingResult = await everythingQuery.get();

      console.log("everything expression", everythingQuery.getExpression());

      expect(everythingResult.count()).toBe(2);
      expect(everythingResult?.[0]?.id).toBe(inserted[0].id);
      expect(everythingResult?.[0]?.name).toBe("John");
      expect(everythingResult?.[1]?.id).toBe(inserted[1].id);
      expect(everythingResult?.[1]?.name).toBe("Jane");
    }

    test('test clone query (postgres)', async () => {
      await execTest(postgres);
    });

    test('test clone query (mongodb)', async () => {
      await execTest(mongodb);
    });
  });
});

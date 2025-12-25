import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

const date2024 = new Date("2024-01-01");
const date2025 = new Date("2025-01-01");

const resetAndRepopulate = async () => {
  await resetPeopleTable();

  await forEveryConnection(async (connection) => {
    await queryBuilder(TestPeopleModel, connection).insert([
      {
        name: "Alice",
        age: 25,
        createdAt: new Date(),
        updatedAt: date2024,
      },
      {
        name: "Bob",
        age: 30,
        createdAt: new Date(),
        updatedAt: date2025,
      },
    ]);
  });
};

describe("eloquent", () => {
  let postgres: EloquentContext;
  let mongodb: EloquentContext;

  beforeAll(async () => {
    await testHelper.testBootApp();
    postgres = EloquentContext.create("postgres");
    mongodb = EloquentContext.create("mongodb");
  });

  beforeEach(async () => {
    await resetAndRepopulate();
  });

  describe("oldest and latest", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel);

      const resuls = await query.clone().oldest("updatedAt").get();
      expect(resuls.count()).toBe(2);
      expect(resuls[0].name).toBe("Alice");
      expect(resuls[1].name).toBe("Bob");

      const resultsSingleOldest = await query
        .clone()
        .oldest("updatedAt")
        .first();
      expect(resultsSingleOldest?.name).toBe("Alice");

      const resultsSingleNewest = await query
        .clone()
        .latest("updatedAt")
        .first();
      expect(resultsSingleNewest?.name).toBe("Bob");
    }

    test("test oldest and latest (postgres)", async () => {
      await execTest(postgres);
    });

    test("test oldest and latest (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  describe("ordering by name", () => {
    const ascendingExecTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel);

      const results = await query.clone().orderBy("name", "asc").get();
      expect(results.count()).toBe(2);
      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Bob");
    }

    const descendingExecTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel);

      const results = await query.clone().orderBy("name", "desc").get();
      expect(results.count()).toBe(2);
      expect(results[0].name).toBe("Bob");
      expect(results[1].name).toBe("Alice");
    }
    test("test by name (asc) (postgres)", async () => {
      await ascendingExecTest(postgres);
    });
  
    test("test by name (asc) (mongodb)", async () => {
      await ascendingExecTest(mongodb);
    });

    test("test by name (desc) (postgres)", async () => {
      await descendingExecTest(postgres);
    });

    test("test by name (desc) (mongodb)", async () => {
      await descendingExecTest(mongodb);
    });
  });

});

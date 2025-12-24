import { IEloquent } from "@/eloquent/index.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestPeopleModel, { resetPeopleTable } from "./legacy-tests/models/TestPeopleModel.js";

const resetAndRepoulateTable = async () => {
  await resetPeopleTable();

  await forEveryConnection(async (connection) => {
    await queryBuilder(TestPeopleModel, connection).insert([
      {
        name: "Alice",
        age: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bob",
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "John",
        age: 35,
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
};

const getTestPeopleModelQueryBuilder = (eloquentContext: EloquentContext): IEloquent<TestPeopleModel> => {
  return eloquentContext.queryBuilder(TestPeopleModel).orderBy(
    "name",
    "asc",
  ) as unknown as IEloquent<TestPeopleModel>;
};

describe("eloquent", () => {
  let query!: IEloquent<TestPeopleModel>;
  let postgres: EloquentContext;
  let mongodb: EloquentContext;

  beforeAll(async () => {
    await testHelper.testBootApp();
    postgres = EloquentContext.create("postgres");
    mongodb = EloquentContext.create("mongodb");
  });

  beforeEach(async () => {
    await resetAndRepoulateTable();
  });

  describe("test insert and select", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      query = getTestPeopleModelQueryBuilder(eloquentContext);

      const initialCount = await query.count();
      expect(initialCount).toBe(4);

      await query.insert({
        name: "Jack",
        age: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const updatedCount = await query.count();
      expect(updatedCount).toBe(5);

      const results = await query.get();
      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Bob");
      expect(results[2].name).toBe("Jack");
      expect(results[3].name).toBe("Jane");
      expect(results[4].name).toBe("John");
    }

    test('test insert and select (postgres)', async () => {
      await execTest(postgres);
    });

    test('test insert and select (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("test insert and delete", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      query = getTestPeopleModelQueryBuilder(eloquentContext);

      const initialCount = await query.count();
      expect(initialCount).toBe(4);

      await query.clone().where("name", "Bob").delete();
      const updatedCount = await query.count();
      expect(updatedCount).toBe(3);

      const results = await query.clone().get();
      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Jane");
      expect(results[2].name).toBe("John");
    }

    test('test insert and delete (postgres)', async () => {
      await execTest(postgres);
    });

    test('test insert and delete (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("test insert and update", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      query = getTestPeopleModelQueryBuilder(eloquentContext);

      const initialCount = await query.count();
      expect(initialCount).toBe(4);

      await query.insert({
        name: "Jack",
        age: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await query.clone().where("name", "Jack").update({ age: 51 });

      const updatedCount = await query.count();
      expect(updatedCount).toBe(5);

      const results = await query.get();
      expect(results[0].name).toBe("Alice");
      expect(results[1].name).toBe("Bob");
      expect(results[2].name).toBe("Jack");
      expect(results[2].age).toBe(51);
      expect(results[3].name).toBe("Jane");
      expect(results[4].name).toBe("John");
    }

    test('test insert and update (postgres)', async () => {
      await execTest(postgres);
    });

    test('test insert and update (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("test select and update", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      query = getTestPeopleModelQueryBuilder(eloquentContext);

      const initialCount = await query.count();
      expect(initialCount).toBe(4);

      await query.insert({
        name: "Jack",
        age: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await query.clone().where("name", "Jack").update({ age: 51 });

      const updatedCount = await query.count();
      expect(updatedCount).toBe(5);

      const jack = await query.clone().where("name", "Jack").first();
      expect(jack?.name).toBe("Jack");
      expect(jack?.age).toBe(51);
    }

    test('test select and update (postgres)', async () => {
      await execTest(postgres);
    });

    test('test select and update (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("test select and delete and insert", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      query = getTestPeopleModelQueryBuilder(eloquentContext);

      const firstBob = await query.clone().where("name", "Bob").first();
      console.log("firstBob", firstBob);
      expect(firstBob?.name).toBe("Bob");

      await query.clone().where("name", "Bob").delete();
      const updatedCount = await query.count();
      expect(updatedCount).toBe(3);

      const secondBob = await query.clone().where("name", "Bob").first();
      expect(secondBob).toBe(null);

      await query.insert({
        name: "Bob",
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const thirdBob = await query.clone().where("name", "Bob").first();
      expect(thirdBob?.name).toBe("Bob");
    }

    test('test select and delete and insert (postgres)', async () => {
      await execTest(postgres);
    });

    test('test select and delete and insert (mongodb)', async () => {
      await execTest(mongodb);
    });
  });
});

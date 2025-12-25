import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

/**
 * NOTE:
 * There is no support for transactions in MongoDB using Eloquent.
 * This requires shards and replica sets to be set up.
 * You can still use the MongoClient API to perform transactions, it is not available in the Eloquent API.
 */

const resetTableAndRepopulate = async () => {
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

describe("transactions", () => {
  let postgres: EloquentContext;

  beforeAll(async () => {
    await testHelper.testBootApp();
    postgres = EloquentContext.create("postgres");
  });

  beforeEach(async () => {
    await resetTableAndRepopulate();
  });

  describe("test successful transaction", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel).orderBy(
        "name",
        "asc",
      );

      await query.clone().transaction(async (trx) => {
        await trx.clone().where("name", "Alice").update({ age: 26 });

        await trx.clone().where("name", "Bob").update({ age: 31 });

        const results = await trx.clone().get();
        expect(results[0].age).toBe(26);
        expect(results[1].age).toBe(31);
      });
    }

    test('test successful transaction (postgres)', async () => {
      await execTest(postgres);
    });
  });

  describe("test unsuccessful transaction", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = eloquentContext.queryBuilder(TestPeopleModel).orderBy(
        "name",
        "asc",
      );

      let exceptionThrown = false;

      try {
        await query.clone().transaction(async (trx) => {
          await trx.clone().where("name", "Alice").update({ age: 26 });

          await trx.clone().where("name", "Bob").update({ age: 31 });

          throw new Error("Transaction failed");
        });
      } catch (error) {
        expect((error as Error).message).toBe("Transaction failed");
        exceptionThrown = true;
      }

      expect(exceptionThrown).toBe(true);

      const results = await query.clone().get();
      expect(results[0].age).toBe(25);
      expect(results[1].age).toBe(30);
    }

    test('test unsuccessful transaction (postgres)', async () => {
      await execTest(postgres);
    });
  });
});

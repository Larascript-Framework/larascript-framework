import { describe } from "@jest/globals";
import { forEveryConnection } from "../tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "../tests-helper/testHelper.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

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

describe("eloquent", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("test successful transaction, excluding mongodb", async () => {
    await resetTableAndRepopulate();

    await forEveryConnection(async (connection) => {
      if (connection === "mongodb") {
        return;
      }

      const query = queryBuilder(TestPeopleModel, connection).orderBy(
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
    });
  });

  test("test unsuccessful transaction, excluding mongodb", async () => {
    await resetTableAndRepopulate();

    await forEveryConnection(async (connection) => {
      if (connection === "mongodb") {
        return;
      }

      const query = queryBuilder(TestPeopleModel, connection).orderBy(
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
    });
  });
});

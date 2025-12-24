import { ModelWithAttributes } from "@/model/index.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import pg from "pg";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

describe("eloquent", () => {
  const resetAndRepopulateTable = async () => {
    await resetPeopleTable();

    await forEveryConnection(async (connection) => {
      await queryBuilder(TestPeopleModel, connection)
        .clone()
        .insert([
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
          {
            name: "Bob",
            age: 35,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "Alice",
            age: 40,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
    });
  };

  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("raw query (postgres)", async () => {
    await resetAndRepopulateTable();

    await forEveryConnection(async (connection) => {
      if (connection !== "postgres") return;
      const query = queryBuilder(TestPeopleModel, connection);
      const sql = `SELECT * FROM ${query.useTable()} WHERE name = $1 OR name = $2 ORDER BY name DESC LIMIT 2`;
      const bindings = ["Alice", "Bob"];

      const results = await query
        .clone()
        .raw<
          pg.QueryResult<NonNullable<TestPeopleModel["attributes"]>>
        >(sql, bindings);
      expect(results.rows.length).toBe(2);
      expect(results.rows[0].name).toBe("Bob");
      expect(results.rows[1].name).toBe("Alice");
    });
  });

  test("raw query (mongo) ", async () => {
    await resetAndRepopulateTable();

    await forEveryConnection(async (connection) => {
      if (connection !== "mongodb") return;

      const query = queryBuilder(TestPeopleModel, connection);

      const aggregate: object[] = [
        {
          $match: {
            name: {
              $in: ["Alice", "Bob"],
            },
          },
        },
      ];

      const results = await query
        .clone()
        .raw<ModelWithAttributes<TestPeopleModel>[]>(aggregate);

      expect(results.length).toBe(2);
    });
  });
});

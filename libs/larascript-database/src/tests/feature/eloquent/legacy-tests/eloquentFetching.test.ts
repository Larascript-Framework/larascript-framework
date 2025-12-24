import ModelNotFoundException from "@/eloquent/exceptions/ModelNotFoundException.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { ITestEmployeeModelData } from "./models/TestEmployeeModel.js";
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
    await resetAndRepopulateTable();
  });

  test("test find, findOrFail, all and get as model", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);
      const inserted = await query.clone().orderBy("name", "asc").get();

      const allResults = await query.clone().all();

      console.log(allResults);

      expect(allResults.count()).toBe(4);
      expect(allResults[0] instanceof TestPeopleModel).toBeTruthy();
      expect(allResults[1] instanceof TestPeopleModel).toBeTruthy();
      expect(allResults[2] instanceof TestPeopleModel).toBeTruthy();
      expect(allResults[3] instanceof TestPeopleModel).toBeTruthy();

      const getResults = await query.clone().get();
      expect(getResults.count()).toBe(4);
      expect(getResults[0] instanceof TestPeopleModel).toBeTruthy();
      expect(getResults[1] instanceof TestPeopleModel).toBeTruthy();
      expect(getResults[2] instanceof TestPeopleModel).toBeTruthy();
      expect(getResults[3] instanceof TestPeopleModel).toBeTruthy();

      const firstResult = await query.clone().find(inserted[0].id);
      expect(firstResult instanceof TestPeopleModel).toBeTruthy();
    });
  });

  test("test find, findOrFail, all and get", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);
      const inserted = await query.clone().orderBy("name", "asc").get();

      expect(inserted.count()).toBe(4);
      expect(inserted[0].id ?? null).toBeTruthy();
      expect(inserted[1].id ?? null).toBeTruthy();
      expect(inserted[2].id ?? null).toBeTruthy();
      expect(inserted[3].id ?? null).toBeTruthy();

      const allResults = await query.clone().all();
      expect(allResults.count()).toBe(4);

      const getResults = await query.clone().get();
      expect(getResults.count()).toBe(4);

      const firstResult = await query.clone().find(inserted[0].id);
      expect(firstResult?.id).toBe(inserted[0].id);

      const lastResult = await query.clone().find(inserted[3].id);
      expect(lastResult?.id).toBe(inserted[3].id);

      const invalidUuid = generateUuidV4();
      const invalidResult = await query.clone().find(invalidUuid);
      expect(invalidResult).toBe(null);

      try {
        await query.clone().where("id", "=", generateUuidV4()).firstOrFail();
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(ModelNotFoundException);
      }

      try {
        await query.clone().where("name", "=", "Invalid Name").lastOrFail();
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(ModelNotFoundException);
      }
    });
  });

  test("test selecting fields", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      const resultsWithAllColumns = await query.clone().select("*").get();

      expect(resultsWithAllColumns.count()).toBe(4);
      expect(resultsWithAllColumns[0].name).toBe("John");

      ["id", "name", "age", "createdAt", "updatedAt"].forEach((column) => {
        const attribtues = resultsWithAllColumns[0]?.getAttributes() ?? {};

        expect(column in attribtues).toBe(true);
      });

      const resultsOnlyName = await query.clone().select("name").get();
      expect(resultsOnlyName.count()).toBe(4);
      expect(resultsOnlyName[0].name).toBe("John");
      const resultsOnlyNameAttributes =
        resultsOnlyName[0]?.getAttributes() ?? {};
      expect(Object.keys(resultsOnlyNameAttributes)).toHaveLength(2); // Name and ID
    });
  });

  test("test with raw sql (postgres)", async () => {
    await forEveryConnection(async (connection) => {
      if (connection !== "postgres") return;

      const query = queryBuilder(TestPeopleModel, "postgres");

      const table = query.useTable();
      const sql = `SELECT * FROM ${table} WHERE name = $1 OR name = $2 ORDER BY name ASC LIMIT 2`;
      const bindings = ["Alice", "Bob"];

      const results = await query.clone().raw(sql, bindings);
      let rows: ITestEmployeeModelData[] = [];

      if (results && typeof results === "object" && "rows" in results) {
        rows = results.rows as ITestEmployeeModelData[];
      }

      expect(rows.length).toBe(2);
      expect(rows?.[0].name).toBe("Alice");
      expect(rows?.[1].name).toBe("Bob");
    });
  });

  test("test with raw select columns (postgres)", async () => {
    const query = queryBuilder(TestPeopleModel, "postgres");

    const results = await query
      .clone()
      .selectRaw('"name", "age", "createdAt"')
      .get();
    expect(results.count()).toBe(4);

    for (const column of ["name", "age", "createdAt"]) {
      const attribtues = results[0]?.getAttributes() ?? {};
      expect(column in attribtues).toBe(true);
    }
  });

  test("test fetching model using array of ids", async () => {
    await resetPeopleTable();

    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);
      await query.clone().insert([
        {
          name: "John",
          age: 25,
          roles: ["admin", "user"],
        },
      ]);

      const john = await query.clone().first();
      const roles = john?.getAttributes()?.roles;
      expect(roles).toBeInstanceOf(Array);
      expect(roles?.length).toBe(2);
      expect(roles?.includes("admin")).toBe(true);
      expect(roles?.includes("user")).toBe(true);
    });
  });
});

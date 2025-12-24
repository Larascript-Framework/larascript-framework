import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestDepartmentModel, {
  resetTableDepartmentModel,
} from "./legacy-tests/models/TestDepartmentModel.js";
import TestEmployeeModel, {
  resetTableEmployeeModel,
} from "./legacy-tests/models/TestEmployeeModel.js";

const dateOneYearInPast = new Date();
dateOneYearInPast.setFullYear(dateOneYearInPast.getFullYear() - 1);

const resetAndRepopulateTables = async () => {
  await resetTableDepartmentModel();
  await resetTableEmployeeModel();

  await forEveryConnection(async (connection) => {
    const insertedDepartments = await queryBuilder(
      TestDepartmentModel,
      connection,
    ).insert([
      {
        deptName: "HR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptName: "Sales",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptName: "IT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptName: "Finance",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryBuilder(TestEmployeeModel, connection).insert([
      {
        deptId: insertedDepartments.find(
          (department) => department?.deptName === "HR",
        )?.id,
        name: "Alice",
        age: 25,
        salary: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptId: insertedDepartments.find(
          (department) => department?.deptName === "Sales",
        )?.id,
        name: "Bob",
        salary: 20000,
        age: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptId: insertedDepartments.find(
          (department) => department?.deptName === "IT",
        )?.id,
        name: "John",
        age: 35,
        salary: 30000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptId: insertedDepartments.find(
          (department) => department?.deptName === "Finance",
        )?.id,
        name: "Jane",
        age: 40,
        salary: 40000,
        createdAt: dateOneYearInPast,
        updatedAt: new Date(),
      },
      {
        deptId: null,
        name: "NoRelationship",
        age: 40,
        salary: 50000,
        createdAt: dateOneYearInPast,
        updatedAt: new Date(),
      },
    ]);
  });
};
describe("delete", () => {
  let postgres: EloquentContext;
  let mongodb: EloquentContext;

  beforeAll(async () => {
    await testHelper.testBootApp();
    postgres = EloquentContext.create("postgres");
    mongodb = EloquentContext.create("mongodb");
  });

  beforeEach(async () => {
    await resetAndRepopulateTables();
    console.log("resetAndRepopulateTables");
  });

  describe("test delete all", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel)

      await employeeQuery.clone().delete();

      const resultCount = await employeeQuery.clone().count();
      expect(resultCount).toBe(0);
    }

    test('test delete all (postgres)', async () => {
      await execTest(postgres);
    });

    test('test delete all (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("delete one", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel);

      await employeeQuery.clone().where("name", "Alice").delete();

      const resultCount = await employeeQuery.clone().count();
      expect(resultCount).toBe(4);

      const resultAlice = await employeeQuery
        .clone()
        .where("name", "Alice")
        .first();
      expect(resultAlice).toBeNull();
    }

    test('test delete one (postgres)', async () => {
      await execTest(postgres);
    });

    test('test delete one (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("delete some", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel);

      await employeeQuery.clone().where("age", ">", 30).delete();

      const resultCount = await employeeQuery.clone().count();
      expect(resultCount).toBe(2);
    }

    test('test delete some (postgres)', async () => {
      await execTest(postgres);
    });

    test('test delete some (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("delete some by date", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel);

      await employeeQuery
        .clone()
        .where("createdAt", ">", dateOneYearInPast)
        .delete();

      const resultCount = await employeeQuery.clone().count();
      expect(resultCount).toBe(2);
    }

    test('test delete some by date (postgres)', async () => {
      await execTest(postgres);
    });

    test('test delete some by date (mongodb)', async () => {
      await execTest(mongodb);
    });
  });

  describe("delete raw with limit", () => {
    test('test delete with limit (postgres)', async () => {
      await postgres.execTest(async (eloquentContext: EloquentContext) => {
        const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel);
  
        await employeeQuery
          .clone()
          .limit(2)
          .whereRaw(`id IN (SELECT id FROM tests_employees LIMIT 2)`)
          .delete();
  
        const resultCount = await employeeQuery.clone().count();
        expect(resultCount).toBe(3);
      });
    });

    test('test delete with limit (mongodb)', async () => {
      await mongodb.execTest(async (eloquentContext: EloquentContext) => {
        const employeeQuery = eloquentContext.queryBuilder(TestEmployeeModel);

        await employeeQuery.clone().limit(2).delete();

        const resultCount = await employeeQuery.clone().count();
        expect(resultCount).toBe(3);
      })
    })
  });
});

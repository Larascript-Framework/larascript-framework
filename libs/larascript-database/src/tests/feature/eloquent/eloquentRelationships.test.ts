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

const resetAndRepopulate = async () => {
  await resetTableEmployeeModel();
  await resetTableDepartmentModel();

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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptId: insertedDepartments.find(
          (department) => department?.deptName === "Finance",
        )?.id,
        name: "Peter",
        age: 50,
        salary: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        deptId: null,
        name: "NoRelationship",
        age: 40,
        salary: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });
};

describe("eloquent", () => {
  let postgres: EloquentContext;
  let mongodb: EloquentContext;

  beforeAll(async () => {
    postgres = EloquentContext.create("postgres");
    mongodb = EloquentContext.create("mongodb");
    await testHelper.testBootApp();
  });

  beforeEach(async () => {
    await resetAndRepopulate();
  });

  describe("belongs to successful", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const alice = await eloquentContext.queryBuilder(TestEmployeeModel)
        .where("name", "Alice")
        .firstOrFail();
      const hr = await eloquentContext.queryBuilder(TestDepartmentModel)
        .where("deptName", "HR")
        .firstOrFail();
      const department = await alice.attr("department");

      expect(department).toBeTruthy();
      expect(department?.id).toBe(hr.attrSync("id"));
      expect(department?.deptName).toBe("HR");
    }

    test("belongs to successful (postgres)", async () => {
      await execTest(postgres);
    });

    test("belongs to successful (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  describe("belongs to no relationship", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const noRelationship = await eloquentContext.queryBuilder(TestEmployeeModel)
        .where("name", "NoRelationship")
        .firstOrFail();
      const department = await noRelationship.attr("department");

      expect(department).toBe(null);
    }

    test("belongs to no relationship (postgres)", async () => {
      await execTest(postgres);
    });

    test("belongs to no relationship (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  describe("has many successful", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const finance = await eloquentContext.queryBuilder(TestDepartmentModel)
        .where("deptName", "Finance")
        .firstOrFail();
      const employees = await finance.attr("employees");

      expect(employees).toBeTruthy();
      expect(employees?.count()).toBe(2);
      expect(
        employees?.find((employee) => employee?.name === "Jane")?.name,
      ).toBe("Jane");
      expect(
        employees?.find((employee) => employee?.name === "Peter")?.name,
      ).toBe("Peter");
    }

    test("has many successful (postgres)", async () => {
      await execTest(postgres);
    });

    test("has many successful (mongodb)", async () => {
      await execTest(mongodb);
    });
  });
});

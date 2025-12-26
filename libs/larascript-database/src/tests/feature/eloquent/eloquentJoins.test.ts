import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestDepartmentModel, {
  resetTableDepartmentModel,
} from "./models/TestDepartmentModel.js";
import TestEmployeeModel, {
  resetTableEmployeeModel,
} from "./models/TestEmployeeModel.js";

const getEmployeeQuery = (eloquentContext: EloquentContext) => {
  return eloquentContext.queryBuilder(TestEmployeeModel).orderBy("name", "asc");
};

const getDepartmentQuery = (eloquentContext: EloquentContext) => {
  return eloquentContext.queryBuilder(TestDepartmentModel).orderBy(
    "deptName",
    "asc",
  );
};

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
describe("joins", () => {
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

  describe("test insert department and employee relations", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);
      const departmentQuery = getDepartmentQuery(eloquentContext);

      const departments = await departmentQuery.clone().all();
      expect(departments.count()).toBe(4);

      const hr = departments.find(
        (department) => department?.deptName === "HR",
      ) as TestDepartmentModel;
      expect(hr).toBeTruthy();

      const sales = departments.find(
        (department) => department?.deptName === "Sales",
      ) as TestDepartmentModel;
      expect(sales).toBeTruthy();

      const it = departments.find(
        (department) => department?.deptName === "IT",
      ) as TestDepartmentModel;
      expect(it).toBeTruthy();

      const finance = departments.find(
        (department) => department?.deptName === "Finance",
      ) as TestDepartmentModel;
      expect(finance).toBeTruthy();

      const employees = await employeeQuery.clone().all();
      expect(employees.count()).toBe(5);

      const alice = employees.find(
        (employee) => employee?.name === "Alice",
      ) as TestEmployeeModel;
      expect(alice.id).toBeTruthy();
      expect(alice.deptId).toBe(hr.id);

      const bob = employees.find(
        (employee) => employee?.name === "Bob",
      ) as TestEmployeeModel;
      expect(bob.id).toBeTruthy();
      expect(bob.deptId).toBe(sales.id);

      const john = employees.find(
        (employee) => employee?.name === "John",
      ) as TestEmployeeModel;
      expect(john.id).toBeTruthy();
      expect(john.deptId).toBe(it.id);

      const jane = employees.find(
        (employee) => employee?.name === "Jane",
      ) as TestEmployeeModel;
      expect(jane.id).toBeTruthy();
      expect(jane.deptId).toBe(finance.id);
    }

    test("test insert department and employee relations (postgres)", async () => {
      await execTest(postgres);
    });

    test("test insert department and employee relations (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  describe("test relational model property", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);
      const departmentQuery = getDepartmentQuery(eloquentContext);

      const aliceModel = await employeeQuery
        .clone()
        .where("name", "Alice")
        .firstOrFail();

      // aliceModel.setConnectionName(connection);
      const department = await aliceModel.attr("department");

      const hr = await departmentQuery
        .clone()
        .where("deptName", "HR")
        .firstOrFail();

      expect(department).toBeTruthy();
      expect(department?.id).toBe(hr?.id);
    }

    test("test relational model property (postgres)", async () => {
      await execTest(postgres);
    });

    test("test relational model property (mongodb)", async () => {
      await execTest(mongodb);
    });
      
  });

  describe("test with", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const alice = await employeeQuery
        .clone()
        .with("department")
        .where("name", "Alice")
        .firstOrFail();

      expect(alice.attrSync("department") as TestDepartmentModel).toBeTruthy();
      expect(alice?.attrSync("department")?.deptName).toBe("HR");

      const bob = await employeeQuery
        .clone()
        .with("department")
        .where("name", "Bob")
        .firstOrFail();

      expect(bob?.attrSync("department")).toBeTruthy();
      expect(bob?.attrSync("department")?.deptName).toBe("Sales");
    }

    test("test with (postgres)", async () => {
      await execTest(postgres);
    });

    test("test with (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  describe("test inner join", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const alice = await employeeQuery
        .clone()
        .join(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "Alice")
        .firstOrFail();

      expect(alice?.attrSync("department")).toBeTruthy();
      expect(alice?.attrSync("department")?.deptName).toBe("HR");
    }

    test("test inner join (postgres)", async () => {
      await execTest(postgres);
    });

    test("test inner join (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  // This test is only relevant for postgres
  // MongoDB does not support joins, so default behavior uses left join
  describe("test inner join, relation not found", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const notFoundRelation = await employeeQuery
        .clone()
        .join(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "NoRelationship")
        .first();

      expect(notFoundRelation).toBe(null);
    }

    test("test inner join, relation not found (postgres)", async () => {
      await execTest(postgres);
    });

  });

  describe("test left join", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const alice = await employeeQuery
        .clone()
        .leftJoin(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "Alice")
        .firstOrFail();

      expect(alice?.attrSync("department")).toBeTruthy();
      expect(alice?.attrSync("department")?.deptName).toBe("HR");

      const notFoundRelation = await employeeQuery
        .clone()
        .leftJoin(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "NoRelationship")
        .firstOrFail();

      expect(notFoundRelation).toBeTruthy();
      expect(notFoundRelation?.department).toBe(null);
    }

    test("test left join (postgres)", async () => {
      await execTest(postgres);
    });

    test("test left join (mongodb)", async () => {
      await execTest(mongodb);
    });
  });

  // This test is only relevant for postgres
  // MongoDB does not support joins, so default behavior uses left join
  describe("test right join", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const alice = await employeeQuery
        .clone()
        .rightJoin(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "Alice")
        .firstOrFail();

      expect(alice?.attrSync("department")).toBeTruthy();
      expect(alice?.attrSync("department")?.deptName).toBe("HR");

      const notFoundRelation = await employeeQuery
        .clone()
        .rightJoin(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "NoRelationship")
        .first();

      expect(notFoundRelation).toBeNull();
    }

    test("test right join (postgres)", async () => {
      await execTest(postgres);
    });
  });

  // This test is only relevant for postgres
  // MongoDB does not support joins, so default behavior uses left join
  describe("test full join", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      // Should find matched records
      const alice = await employeeQuery
        .clone()
        .fullJoin(TestDepartmentModel, "deptId", "id", "department")
        .where("name", "Alice")
        .firstOrFail();

      expect(alice?.attrSync("department")).toBeTruthy();
      expect(alice?.attrSync("department")?.deptName).toBe("HR");

      // Should find unmatched employee (NoRelationship)
      const notFoundRelation = await employeeQuery
        .clone()
        .fullJoin(TestDepartmentModel, "deptId", "id", "department")
        .setModelColumns(TestDepartmentModel, {
          columnPrefix: "department_",
          targetProperty: "department",
        })
        .where("name", "NoRelationship")
        .firstOrFail();

      expect(notFoundRelation).toBeTruthy();
      expect(notFoundRelation?.department).toBeNull();
    }

    test("test full join (postgres)", async () => {
      await execTest(postgres);
    });

  });

  // This test is only relevant for postgres
  // MongoDB does not support joins, so default behavior uses left join
  describe("test cross join", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const employeeQuery = getEmployeeQuery(eloquentContext);

      const results = await employeeQuery
        .clone()
        .crossJoin(TestDepartmentModel)
        .setModelColumns(TestDepartmentModel, {
          columnPrefix: "department_",
          targetProperty: "department",
        })
        .all();

      // With 5 employees and 4 departments, should get 20 rows
      expect(results.count()).toBe(20);
    }

    test("test cross join (postgres)", async () => {
      await execTest(postgres);
    });
  });
});

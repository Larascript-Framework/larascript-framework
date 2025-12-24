import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe } from "@jest/globals";
import { EloquentContext } from "./EloquestContext.js";
import TestPeopleModel, { resetPeopleTable } from "./legacy-tests/models/TestPeopleModel.js";

const getYearsDate = (year: number): Date => {
  const date = new Date();
  date.setFullYear(year);
  return date;
};

const getYearsInPastSince2050 = (years: number): Date => {
  const date = new Date();
  date.setFullYear(2050);
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const dateOneYearInPast = new Date();
dateOneYearInPast.setFullYear(dateOneYearInPast.getFullYear() - 1);

const resetAndPopulate = async () => {
  await resetPeopleTable();

  await forEveryConnection(async (connection) => {
    const query = queryBuilder(TestPeopleModel, connection);

    await query.insert([
      {
        name: "Alice",
        age: 25,
        born: getYearsInPastSince2050(25), // 2025
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bob",
        age: 30,
        born: getYearsInPastSince2050(30), // 2020
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "John",
        age: 35,
        born: getYearsInPastSince2050(35), // 2015
        createdAt: dateOneYearInPast,
        updatedAt: dateOneYearInPast,
      },
      {
        name: "Jane",
        age: 45,
        born: getYearsInPastSince2050(45), // 2005
        createdAt: dateOneYearInPast,
        updatedAt: dateOneYearInPast,
      },
    ]);
  });
};

const getTestPeopleModelQuery = (eloquentTest: string | EloquentContext) => {
  if(typeof eloquentTest === "string") {
    return queryBuilder(TestPeopleModel, eloquentTest).orderBy("name", "asc");
  }
  return eloquentTest.queryBuilder(TestPeopleModel).orderBy("name", "asc");
};

describe("eloquent", () => {
  let eloquentPostgres: EloquentContext;
  let eloquentMongodb: EloquentContext;

  beforeAll(async () => {
    await testHelper.testBootApp();
    eloquentPostgres = EloquentContext.create("postgres");
    eloquentMongodb = EloquentContext.create("mongodb");
  });

  beforeEach(async () => {
    await resetAndPopulate();
  });

  describe('raw where', () => {
    test('test raw where (postgres)', async () => {
      eloquentPostgres.execTest(async (eloquentContext) => {
        const query = getTestPeopleModelQuery(eloquentContext);
        const inserted = await query.clone().orderBy("name", "asc").get();
  
        const insertedJohn = inserted.find((person) => person.name === "John");
  
        const resultsOnlyJohn = await query
          .clone()
          .whereRaw('"name" = $1', ["John"])
          .first();
  
        expect(resultsOnlyJohn?.id).toBe(insertedJohn?.id);
        expect(resultsOnlyJohn?.name).toBe("John");
      })
    });

    test('test raw where (mongodb)', async () => {
      eloquentMongodb.execTest(async (eloquentContext) => {
        const resultsJohn = await eloquentContext.queryBuilder(TestPeopleModel).whereRaw({
          name: {
            $eq: "John",
          },
        })
        .first();

        expect(resultsJohn?.id).toBeDefined();
        expect(resultsJohn?.name).toBe("John");
      })
    });
  });


  describe("test equals", () => {
    const execTest = async (eloquentContext: EloquentContext) => {                                  
      const query = getTestPeopleModelQuery(eloquentContext);
      const resultsOnlyJohn = await query.clone().where("name", "John").get();

      expect(resultsOnlyJohn.count()).toBe(1);
      expect(resultsOnlyJohn[0].name).toBe("John");                           
    }

    test('test equals (postgres)', async () => {
      await execTest(eloquentMongodb);
    });
    
    test('test equals (mongodb)', async () => {
      await execTest(eloquentPostgres);
    });
  });

  describe("test filters with object",  () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const resultsJohnExactMatchNotFound = await query
        .clone()
        .where({ name: "john" })
        .first();

      expect(resultsJohnExactMatchNotFound).toBe(null);

      const resultsOnlyJohnFoundUsingLike = await query
        .clone()
        .where({ name: "john" }, "like")
        .first();

      expect(resultsOnlyJohnFoundUsingLike).toBeDefined();
      expect(resultsOnlyJohnFoundUsingLike?.name).toBe("John");

    }

    test('test filters with object (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test filters with object (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test equals with OR operator", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const resultsOnlyJohnOrJane = await query
        .clone()
        .where("name", "=", "John")
        .orWhere("name", "=", "Jane")
        .get();

      expect(resultsOnlyJohnOrJane.count()).toBe(2);
      expect(resultsOnlyJohnOrJane[0].name).toBe("Jane");
      expect(resultsOnlyJohnOrJane[1].name).toBe("John");

      const resultsYoungerThan30OrOlderThan40 = await query
        .clone()
        .where("age", "<", 30)
        .orWhere("age", ">", 40)
        .get();

      expect(resultsYoungerThan30OrOlderThan40.count()).toBe(2);
      expect(resultsYoungerThan30OrOlderThan40[0].name).toBe("Alice");
      expect(resultsYoungerThan30OrOlderThan40[1].name).toBe("Jane");
    }

    test('test equals with OR operator (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test equals with OR operator (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test complex or", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const results = await query
        .clone()
        .where("age", ">", 30)
        .orWhere("name", "like", "J%")
        .get();

      expect(results.count()).toBe(2);
      expect(results[0].name).toBe("Jane");
      expect(results[1].name).toBe("John");
    }

    test('test complex or (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test complex or (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test greater than and greater than or equal", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const resultsGreaterThan35YearsOld = await query
        .clone()
        .where("age", ">", 35)
        .get();
      expect(resultsGreaterThan35YearsOld.count()).toBe(1);
      expect(resultsGreaterThan35YearsOld[0].name).toBe("Jane");

      const resultsGreaterThanOrEqual35YearsOld = await query
        .clone()
        .where("age", ">=", 35)
        .get();
      expect(resultsGreaterThanOrEqual35YearsOld.count()).toBe(2);
      expect(resultsGreaterThanOrEqual35YearsOld[0].name).toBe("Jane");
      expect(resultsGreaterThanOrEqual35YearsOld[1].name).toBe("John");
    }

    test('test greater than and greater than or equal (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test greater than and greater than or equal (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test less than and less than or equal", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const resultsLessThan30YearsOld = await query
        .clone()
        .where("age", "<", 30)
        .get();
      expect(resultsLessThan30YearsOld.count()).toBe(1);
      expect(resultsLessThan30YearsOld[0].name).toBe("Alice");

      const resultsLessThan30YearsOldOrEqual = await query
        .clone()
        .where("age", "<=", 30)
        .get();
      expect(resultsLessThan30YearsOldOrEqual.count()).toBe(2);
      expect(resultsLessThan30YearsOldOrEqual[0].name).toBe("Alice");
      expect(resultsLessThan30YearsOldOrEqual[1].name).toBe("Bob");
    }

    test('test less than and less than or equal (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test less than and less than or equal (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test where in and where not in", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const results25And30 = await query.clone().whereIn("age", [25, 30]).get();
      expect(results25And30.count()).toBe(2);
      expect(results25And30[0].name).toBe("Alice");
      expect(results25And30[1].name).toBe("Bob");

      const resultsExclude25 = await query
        .clone()
        .whereNotIn("age", [25])
        .get();
      expect(resultsExclude25.count()).toBe(3);
      expect(resultsExclude25[0].name).toBe("Bob");
      expect(resultsExclude25[1].name).toBe("Jane");
      expect(resultsExclude25[2].name).toBe("John");
    }

    test('test where in and where not in (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test where in and where not in (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test where in between and where not in between", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);

      const resultBetween31And39 = await query
        .clone()
        .whereBetween("age", [31, 39])
        .get();
      expect(resultBetween31And39.count()).toBe(1);
      expect(resultBetween31And39[0].name).toBe("John");

      const resultsNotBetween31And39 = await query
        .clone()
        .whereNotBetween("age", [31, 39])
        .get();
      expect(resultsNotBetween31And39.count()).toBe(3);
      expect(resultsNotBetween31And39[0].name).toBe("Alice");
      expect(resultsNotBetween31And39[1].name).toBe("Bob");
      expect(resultsNotBetween31And39[2].name).toBe("Jane");

      const date2020 = getYearsDate(2020);
      const date2026 = getYearsDate(2026);
      const resultsBetween2006And2029 = await query
        .clone()
        .whereBetween("born", [date2020, date2026])
        .get();
      console.log(
        "resultsBetween2006And2029",
        resultsBetween2006And2029.toArray(),
      );
      expect(resultsBetween2006And2029.count()).toBe(1);
      expect(resultsBetween2006And2029[0].name).toBe("Alice");

      const date2024 = getYearsDate(2024);
      const date2027 = getYearsDate(2027);
      const resultsNotBetween2024And2027 = await query
        .clone()
        .whereNotBetween("born", [date2024, date2027])
        .get();
      expect(resultsNotBetween2024And2027.count()).toBe(3);
      expect(resultsNotBetween2024And2027[0].name).toBe("Bob");
      expect(resultsNotBetween2024And2027[1].name).toBe("Jane");
      expect(resultsNotBetween2024And2027[2].name).toBe("John");
    }

    test('test where in between and where not in between (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test where in between and where not in between (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });

  describe("test where using id property", () => {
    const execTest = async (eloquentContext: EloquentContext) => {
      const query = getTestPeopleModelQuery(eloquentContext);
    
      const inserted = await query.insert({
        name: "George",
        age: 25,
        born: getYearsInPastSince2050(25), // 2025
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const george = await query
        .clone()
        .where("id", inserted[0].getAttributeSync("id"))
        .first();
  
      expect(george).toBeInstanceOf(TestPeopleModel);
      expect(george?.attrSync("id")).toEqual(inserted[0].attrSync("id"));
    }

    test('test where using id property (postgres)', async () => {
      await execTest(eloquentPostgres);
    });

    test('test where using id property (mongodb)', async () => {
      await execTest(eloquentMongodb);
    });
  });
});

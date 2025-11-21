import { describe } from "@jest/globals";
import { forEveryConnection } from "../tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "../tests-helper/testHelper.js";
import TestPeopleModel, { resetPeopleTable } from "./models/TestPeopleModel.js";

describe("eloquent", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
    await resetPeopleTable();
  });

  test("test updating records", async () => {
    await forEveryConnection(async (connection) => {
      const query = queryBuilder(TestPeopleModel, connection);

      await query.insert([
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
      ]);
      const results = await query.clone().orderBy("name").get();

      const janeId = results.find((person) => person.name === "Jane")?.id;
      expect(typeof janeId).toBe("string");
      const johnId = results.find((person) => person.name === "John")?.id;
      expect(typeof johnId).toBe("string");

      const updatedFirst = await query
        .clone()
        .where("name", "John")
        .update({ age: 26 });
      expect(updatedFirst.count()).toBe(1);
      expect(updatedFirst[0].id).toBe(johnId);
      expect(updatedFirst[0].age).toBe(26);

      const updatedSecond = await query
        .clone()
        .where("name", "Jane")
        .update({ age: 31 });
      expect(updatedSecond.count()).toBe(1);
      expect(updatedSecond[0].id).toBe(janeId);
      expect(updatedSecond[0].age).toBe(31);

      const updatedBoth = await query
        .clone()
        .orderBy("name")
        .updateAll({ age: 27 });
      const johnInUpdatedBoth = updatedBoth.find(
        (person) => person.name === "John",
      );
      const janeInUpdatedBoth = updatedBoth.find(
        (person) => person.name === "Jane",
      );

      expect(updatedBoth.count()).toBe(2);
      expect(johnInUpdatedBoth?.id).toBe(johnId);
      expect(johnInUpdatedBoth?.age).toBe(27);
      expect(janeInUpdatedBoth?.id).toBe(janeId);
      expect(janeInUpdatedBoth?.age).toBe(27);
    });
  });
});

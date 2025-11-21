import { DB } from "@/database/index.js";
import { forEveryConnection } from "../tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "../tests-helper/testHelper.js";
import TestDirtyModel, { resetDirtyTable } from "./models/TestDirtyModel.js";

const resetAndPopulateDirtyTable = async () => {
  await resetDirtyTable();

  await forEveryConnection(async (connectionName) => {
    await queryBuilder(TestDirtyModel, connectionName).insert([
      {
        name: "John",
        array: ["a", "b"],
        object: {
          a: 1,
          b: 1,
        },
      },
    ]);
  });
};

describe("model dirty", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("model dirty", async () => {
    await forEveryConnection(async (connectionName) => {
      DB.getInstance().logger()?.console("[Connection]", connectionName);
      await resetAndPopulateDirtyTable();

      const modelOne = await queryBuilder(TestDirtyModel, connectionName)
        .where("name", "John")
        .firstOrFail();
      expect(modelOne.isDirty()).toBeFalsy();

      await modelOne.attr("name", "Jane");
      expect(modelOne.isDirty()).toBeTruthy();
      expect(
        Object.keys(modelOne.getDirty() ?? {}).includes("name"),
      ).toBeTruthy();
      expect(modelOne.getOriginal("name") === "John");

      await modelOne.attr("array", ["a", "b", "c"]);
      expect(modelOne.isDirty()).toBeTruthy();
      const containsDirtyArray = Object.keys(
        modelOne.getDirty() ?? {},
      ).includes("array");
      expect(containsDirtyArray).toBeTruthy();
      expect((modelOne.getOriginal("array") as string[])?.length).toEqual(2);

      await modelOne.attr("object", {
        a: 2,
        b: 2,
      });
      expect(modelOne.isDirty()).toBeTruthy();
      const containsDirtyObject = Object.keys(
        modelOne.getDirty() ?? {},
      ).includes("object");
      expect(containsDirtyObject).toBeTruthy();
      expect(
        (modelOne.getOriginal("object") as { a: number; b: number })?.a,
      ).toEqual(1);
      expect(
        (modelOne.getOriginal("object") as { a: number; b: number })?.b,
      ).toEqual(1);

      await modelOne.save();
      expect(modelOne.isDirty()).toBeFalsy();

      await modelOne.attr("name", "Bob");
      expect(modelOne.isDirty()).toBeTruthy();
      const containsDirtyName = Object.keys(modelOne.getDirty() ?? {}).includes(
        "name",
      );
      expect(containsDirtyName).toBeTruthy();
      expect(modelOne.getOriginal("name") === "Jane");

      await modelOne.delete();
      expect(modelOne.isDirty()).toBeFalsy();

      await queryBuilder(TestDirtyModel, connectionName).insert({
        name: "John",
        array: ["a", "b"],
        object: {
          a: 1,
          b: 1,
        },
      });

      const modelTwo = await queryBuilder(TestDirtyModel, connectionName)
        .where("name", "John")
        .firstOrFail();
      expect(modelTwo).toBeTruthy();
      expect(modelTwo.isDirty()).toBeFalsy();

      await modelTwo.attr("name", "Jane");
      expect(modelTwo.isDirty()).toBeTruthy();
      const containsDirtyName2 = Object.keys(
        modelTwo.getDirty() ?? {},
      ).includes("name");
      expect(containsDirtyName2).toBeTruthy();
      expect(modelTwo.getOriginal("name") === "John");

      await modelTwo.attr("array", ["a", "b", "c"]);
      expect(modelTwo.isDirty()).toBeTruthy();
      const containsDirtyArray2 = Object.keys(
        modelTwo.getDirty() ?? {},
      ).includes("array");
      expect(containsDirtyArray2).toBeTruthy();
      expect((modelTwo.getAttributeSync("array") as string[])?.length).toEqual(
        3,
      );
      expect((modelTwo.getOriginal("array") as string[])?.length).toEqual(2);

      await modelTwo.attr("object", {
        a: 2,
        b: 2,
      });
      expect(modelTwo.isDirty()).toBeTruthy();
      const containsDirtyObject2 = Object.keys(
        modelTwo.getDirty() ?? {},
      ).includes("object");
      expect(containsDirtyObject2).toBeTruthy();
      expect(
        (modelTwo.getAttributeSync("object") as { a: number; b: number })?.a,
      ).toEqual(2);
      expect(
        (modelTwo.getAttributeSync("object") as { a: number; b: number })?.b,
      ).toEqual(2);
      expect(
        (modelTwo.getOriginal("object") as { a: number; b: number })?.a,
      ).toEqual(1);
      expect(
        (modelTwo.getOriginal("object") as { a: number; b: number })?.b,
      ).toEqual(1);
    });
  });
});

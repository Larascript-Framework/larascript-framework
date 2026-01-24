import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe, expect, test } from "@jest/globals";
import TestPeopleModel, {
    resetPeopleTable,
} from "../eloquent/models/TestPeopleModel.js";

describe("test model crud", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("CRUD", async () => {
    await forEveryConnection(async (connectionName) => {
      await resetPeopleTable();

      const builder = queryBuilder(TestPeopleModel, connectionName);

      /**
       * Create a model
       */
      const createdModel = new TestPeopleModel(null);
      await createdModel.setAttribute("name", "John");
      await createdModel.setAttribute("age", 30);
      createdModel.setConnectionName(connectionName);

      expect(createdModel.getId()).toBeFalsy();
      expect(createdModel.getAttributeSync("name")).toEqual("John");
      expect(createdModel.getAttributeSync("age")).toEqual(30);

      // Check timestamps are not set
      expect(createdModel.getAttributeSync("createdAt")).toBeFalsy();
      expect(createdModel.getAttributeSync("updatedAt")).toBeFalsy();

      await createdModel.save();
      expect(typeof createdModel.getId() === "string").toBe(true);

      // Check timestamps are set
      expect(createdModel.getAttributeSync("createdAt") instanceof Date).toBe(
        true,
      );
      expect(createdModel.getAttributeSync("updatedAt") instanceof Date).toBe(
        true,
      );

      /**
       * Change name attribute
       */
      await createdModel.setAttribute("name", "Jane");
      await createdModel.save();
      expect(typeof createdModel.getId() === "string").toBe(true);
      expect(createdModel.getAttributeSync("name")).toEqual("Jane");

      /**
       * Query with repository
       */
      const fetchedModel = await builder.clone().where("name", "Jane").first();
      expect(fetchedModel).toBeTruthy();
      expect(fetchedModel?.getId() === createdModel.getId()).toBe(true);
      expect(fetchedModel?.getAttributeSync("name")).toEqual("Jane");

      /**
       * Delete the model
       */
      await createdModel.delete();
      expect(createdModel.getId()).toBeFalsy();
      expect(await createdModel.getAttributes()).toBeFalsy();

      /**
       * Check if the model is deleted
       */
      const models = await queryBuilder(TestPeopleModel, connectionName).all();
      expect(models.count()).toEqual(0);
    });
  });
});

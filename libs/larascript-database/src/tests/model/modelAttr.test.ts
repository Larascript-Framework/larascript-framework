import TestModel from "@/tests/model/models/TestModel.js";
import { testHelper } from "@/tests/tests-helper/testHelper.js";
import { describe, expect, test } from "@jest/globals";

describe("test model attr", () => {
  beforeAll(async () => {
    await testHelper.testBootApp();
  });

  test("attr", async () => {
    const model = new TestModel({
      name: "John",
    });
    expect(await model.attr("name")).toEqual("John");

    await model.attr("name", "Jane");
    expect(await model.attr("name")).toEqual("Jane");

    const modelNoProperties = new TestModel(null);
    await modelNoProperties.attr("name", "John");
    expect(await modelNoProperties.attr("name")).toEqual("John");
  });
});

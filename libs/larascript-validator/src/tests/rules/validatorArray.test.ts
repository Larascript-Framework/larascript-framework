import ArrayRule from "@/validator/rules/ArrayRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("simple isArray, passes", async () => {
    const validator = Validator.make({
      numbers: [new ArrayRule()],
    });

    const result = await validator.validate({ numbers: [1, 2, 3] });
    expect(result.passes()).toBe(true);
  });

  test("simple isArray, fails", async () => {
    const validator = Validator.make({
      numbers: [new ArrayRule()],
    });

    const result = await validator.validate({ numbers: "not an array" });
    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      numbers: ["The numbers field must be an array."],
    });
  });

  test("empty array should pass", async () => {
    const validator = Validator.make({
      numbers: [new ArrayRule()],
    });

    const result = await validator.validate({ numbers: [] });
    expect(result.passes()).toBe(true);
  });

  test("array with mixed types should pass", async () => {
    const validator = Validator.make({
      mixed: [new ArrayRule()],
    });

    const result = await validator.validate({
      mixed: [1, "string", true, { key: "value" }],
    });
    expect(result.passes()).toBe(true);
  });

  test("object should fail", async () => {
    const validator = Validator.make({
      data: [new ArrayRule()],
    });

    const result = await validator.validate({ data: { key: "value" } });
    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      data: ["The data field must be an array."],
    });
  });

  test("null should fail", async () => {
    const validator = Validator.make({
      data: [new ArrayRule()],
    });

    const result = await validator.validate({ data: null });
    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      data: ["The data field must be an array."],
    });
  });

  test("undefined should fail", async () => {
    const validator = Validator.make({
      data: [new ArrayRule()],
    });

    const result = await validator.validate({ data: undefined });
    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      data: ["The data field must be an array."],
    });
  });
});

import { NullableRule, StringRule, Validator } from "@/validator/index.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("accepts null values", async () => {
    const validator = Validator.make({
      name: [new StringRule(), new NullableRule()],
    });

    const result = await validator.validate({ name: null });

    expect(result.passes()).toBe(true);
  });

  test("accepts undefined values", async () => {
    const validator = Validator.make({
      name: [new StringRule(), new NullableRule()],
    });

    const result = await validator.validate({ name: undefined });

    expect(result.passes()).toBe(true);
  });

  test("still validates non-null values", async () => {
    const validator = Validator.make({
      name: [new StringRule(), new NullableRule()],
    });

    const result = await validator.validate({ name: 123 }); // number instead of string

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["The name field must be a string."],
    });
  });

  test("works with multiple nullable fields", async () => {
    const validator = Validator.make({
      firstName: [new StringRule(), new NullableRule()],
      lastName: [new StringRule(), new NullableRule()],
    });

    const result = await validator.validate({
      firstName: null,
      lastName: "Doe",
    });

    expect(result.passes()).toBe(true);
  });
});

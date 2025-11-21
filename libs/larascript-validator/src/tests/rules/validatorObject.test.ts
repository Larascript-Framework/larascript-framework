import ObjectRule from "@/validator/rules/ObjectRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("ObjectRule, passes", async () => {
    const validator = Validator.make({
      objectField: [new ObjectRule()],
    });

    const result = await validator.validate({
      objectField: { key: "value" },
    });

    expect(result.passes()).toBe(true);
  });

  test("ObjectRule, fails with non-object value", async () => {
    const validator = Validator.make({
      objectField: [new ObjectRule()],
    });

    const result = await validator.validate({
      objectField: 123,
    });

    expect(result.passes()).toBe(false);
  });

  test("required properties should pass", async () => {
    const validator = Validator.make({
      data: [new ObjectRule(["name", "age"])],
    });

    const result = await validator.validate({
      data: { name: "John", age: 30 },
    });
    expect(result.passes()).toBe(true);
  });

  test("required properties should fail", async () => {
    const validator = Validator.make({
      data: [new ObjectRule(["name", "age", "id"])],
    });

    const result = await validator.validate({
      data: { name: "John", age: 30 },
    });
    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      data: [
        "The data field must contain the following properties: name, age, id.",
      ],
    });
  });
});

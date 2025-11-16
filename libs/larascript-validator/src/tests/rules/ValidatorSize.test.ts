import SizeRule from "@/validator/rules/SizeRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test size validation rule", () => {
  // Test size validation with numbers
  it("passes when number equals size value", async () => {
    const validator = new Validator({
      age: [new SizeRule(18)],
    });
    const result = await validator.validate({
      age: 18,
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when number is less than size value", async () => {
    const validator = new Validator({
      age: [new SizeRule(18)],
    });
    const result = await validator.validate({
      age: 16,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["The age field must be 18."],
    });
  });

  it("fails when number is greater than size value", async () => {
    const validator = new Validator({
      age: [new SizeRule(18)],
    });
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["The age field must be 18."],
    });
  });

  // Test size validation with strings
  it("passes when string length equals size value", async () => {
    const validator = new Validator({
      code: [new SizeRule(4)],
    });
    const result = await validator.validate({
      code: "ABC1",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when string length is not equal to size value", async () => {
    const validator = new Validator({
      code: [new SizeRule(4)],
    });
    const result = await validator.validate({
      code: "ABC12",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      code: ["The code field must be 4 characters."],
    });
  });

  // Test size validation with arrays
  it("passes when array length equals size value", async () => {
    const validator = new Validator({
      items: [new SizeRule(3)],
    });
    const result = await validator.validate({
      items: [1, 2, 3],
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when array length is not equal to size value", async () => {
    const validator = new Validator({
      items: [new SizeRule(3)],
    });
    const result = await validator.validate({
      items: [1, 2, 3, 4],
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      items: ["The items field must contain 3 items."],
    });
  });

  // Test invalid input types
  it("fails when value is null", async () => {
    const validator = new Validator({
      age: [new SizeRule(18)],
    });
    const result = await validator.validate({
      age: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      age: [new SizeRule(18)],
    });
    const result = await validator.validate({
      age: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  // Test with custom error message
  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        age: [new SizeRule(18)],
      },
      {
        "age.size": "Age must be exactly 18 years",
      },
    );
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["Age must be exactly 18 years"],
    });
  });
});

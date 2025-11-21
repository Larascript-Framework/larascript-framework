import MinRule from "@/validator/rules/MinRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test min validation rule", () => {
  // Test min validation with numbers
  it("passes when number is greater than min value", async () => {
    const validator = new Validator({
      age: [new MinRule(18)],
    });
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(true);
  });

  it("passes when number equals min value", async () => {
    const validator = new Validator({
      age: [new MinRule(18)],
    });
    const result = await validator.validate({
      age: 18,
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when number is less than min value", async () => {
    const validator = new Validator({
      age: [new MinRule(18)],
    });
    const result = await validator.validate({
      age: 16,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["The age field must be at least 18."],
    });
  });

  // Test min validation with strings
  it("passes when string length is greater than min value", async () => {
    const validator = new Validator({
      name: [new MinRule(5)],
    });
    const result = await validator.validate({
      name: "John Doe",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when string length is less than min value", async () => {
    const validator = new Validator({
      name: [new MinRule(5)],
    });
    const result = await validator.validate({
      name: "John",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["The name field must be at least 5 characters."],
    });
  });

  // Test min validation with arrays
  it("passes when array length is greater than min value", async () => {
    const validator = new Validator({
      items: [new MinRule(3)],
    });
    const result = await validator.validate({
      items: [1, 2, 3, 4, 5],
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when array length is less than min value", async () => {
    const validator = new Validator({
      items: [new MinRule(3)],
    });
    const result = await validator.validate({
      items: [1, 2],
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      items: ["The items field must have at least 3 items."],
    });
  });

  // Test invalid input types
  it("fails when value is null", async () => {
    const validator = new Validator({
      age: [new MinRule(18)],
    });
    const result = await validator.validate({
      age: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      age: [new MinRule(18)],
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
        age: [new MinRule(18)],
      },
      {
        "age.min": "You must be at least 18 years old",
      },
    );
    const result = await validator.validate({
      age: 16,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["You must be at least 18 years old"],
    });
  });
});

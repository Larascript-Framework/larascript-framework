import MaxRule from "@/validator/rules/MaxRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test max validation rule", () => {
  // Test max validation with numbers
  it("passes when number is less than max value", async () => {
    const validator = new Validator({
      age: [new MaxRule(18)],
    });
    const result = await validator.validate({
      age: 16,
    });

    expect(result.passes()).toBe(true);
  });

  it("passes when number equals max value", async () => {
    const validator = new Validator({
      age: [new MaxRule(18)],
    });
    const result = await validator.validate({
      age: 18,
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when number is greater than max value", async () => {
    const validator = new Validator({
      age: [new MaxRule(18)],
    });
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["The age field must not be greater than 18."],
    });
  });

  // Test max validation with strings
  it("passes when string length is less than max value", async () => {
    const validator = new Validator({
      name: [new MaxRule(10)],
    });
    const result = await validator.validate({
      name: "John",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when string length is greater than max value", async () => {
    const validator = new Validator({
      name: [new MaxRule(5)],
    });
    const result = await validator.validate({
      name: "John Doe",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["The name field must not be greater than 5 characters."],
    });
  });

  // Test max validation with arrays
  it("passes when array length is less than max value", async () => {
    const validator = new Validator({
      items: [new MaxRule(5)],
    });
    const result = await validator.validate({
      items: [1, 2, 3],
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when array length is greater than max value", async () => {
    const validator = new Validator({
      items: [new MaxRule(3)],
    });
    const result = await validator.validate({
      items: [1, 2, 3, 4, 5],
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      items: ["The items field must not have more than 3 items."],
    });
  });

  // Test invalid input types
  it("fails when value is null", async () => {
    const validator = new Validator({
      age: [new MaxRule(18)],
    });
    const result = await validator.validate({
      age: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      age: [new MaxRule(18)],
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
        age: [new MaxRule(18)],
      },
      {
        "age.max": "Age cannot be more than 18 years",
      },
    );
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      age: ["Age cannot be more than 18 years"],
    });
  });
});

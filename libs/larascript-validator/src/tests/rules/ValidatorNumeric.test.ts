import NumericRule from "@/validator/rules/NumericRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test numeric validation rule", () => {
  it("passes for integer numbers", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: 123,
    });

    expect(result.passes()).toBe(true);
  });

  it("passes for decimal numbers", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: 123.45,
    });

    expect(result.passes()).toBe(true);
  });

  it("passes for negative numbers", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: -123,
    });

    expect(result.passes()).toBe(true);
  });

  it("passes for numeric strings", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: "123",
    });

    expect(result.passes()).toBe(true);
  });

  it("passes for decimal strings", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: "123.45",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails for non-numeric strings", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: "abc",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      value: ["The value field must be numeric."],
    });
  });

  it("fails for strings with spaces", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: "123 456",
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails for boolean values", async () => {
    const validator = new Validator({
      value: [new NumericRule()],
    });
    const result = await validator.validate({
      value: true,
    });

    expect(result.passes()).toBe(false);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        value: [new NumericRule()],
      },
      {
        "value.numeric": "Please provide a numeric value",
      },
    );
    const result = await validator.validate({
      value: "abc",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      value: ["Please provide a numeric value"],
    });
  });
});

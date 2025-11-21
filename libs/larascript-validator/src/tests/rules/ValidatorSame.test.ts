import SameRule from "@/validator/rules/SameRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test same validation rule", () => {
  it("passes when fields have same value", async () => {
    const validator = new Validator({
      password: [new SameRule("passwordConfirmation")],
    });
    const result = await validator.validate({
      password: "secret123",
      passwordConfirmation: "secret123",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when fields have different values", async () => {
    const validator = new Validator({
      password: [new SameRule("passwordConfirmation")],
    });
    const result = await validator.validate({
      password: "secret123",
      passwordConfirmation: "different",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      password: ["The password field must match passwordConfirmation."],
    });
  });

  it("fails when other field is missing", async () => {
    const validator = new Validator({
      password: [new SameRule("passwordConfirmation")],
    });
    const result = await validator.validate({
      password: "secret123",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      password: ["The password field must match passwordConfirmation."],
    });
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      password: [new SameRule("passwordConfirmation")],
    });
    const result = await validator.validate({
      password: null,
      passwordConfirmation: "secret123",
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      password: [new SameRule("passwordConfirmation")],
    });
    const result = await validator.validate({
      password: undefined,
      passwordConfirmation: "secret123",
    });

    expect(result.passes()).toBe(false);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        password: [new SameRule("passwordConfirmation")],
      },
      {
        "password.same": "Password and confirmation must match",
      },
    );
    const result = await validator.validate({
      password: "secret123",
      passwordConfirmation: "different",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      password: ["Password and confirmation must match"],
    });
  });
});

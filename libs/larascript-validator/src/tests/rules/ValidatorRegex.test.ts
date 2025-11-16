import RegexRule from "@/validator/rules/RegexRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test regex validation rule", () => {
  it("passes when value matches regex pattern", async () => {
    const validator = new Validator({
      username: [new RegexRule("^[a-zA-Z0-9]+$")],
    });
    const result = await validator.validate({
      username: "john123",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when value does not match regex pattern", async () => {
    const validator = new Validator({
      username: [new RegexRule("^[a-zA-Z0-9]+$")],
    });
    const result = await validator.validate({
      username: "john@123",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      username: ["The username field format is invalid."],
    });
  });

  it("accepts RegExp object as pattern", async () => {
    const validator = new Validator({
      username: [new RegexRule(/^[a-zA-Z0-9]+$/)],
    });
    const result = await validator.validate({
      username: "john123",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      username: [new RegexRule("^[a-zA-Z0-9]+$")],
    });
    const result = await validator.validate({
      username: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      username: [new RegexRule("^[a-zA-Z0-9]+$")],
    });
    const result = await validator.validate({
      username: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        username: [new RegexRule("^[a-zA-Z0-9]+$")],
      },
      {
        "username.regex": "Username can only contain letters and numbers",
      },
    );
    const result = await validator.validate({
      username: "john@123",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      username: ["Username can only contain letters and numbers"],
    });
  });

  it("converts non-string values to string before testing", async () => {
    const validator = new Validator({
      code: [new RegexRule("^[0-9]+$")],
    });
    const result = await validator.validate({
      code: 12345,
    });

    expect(result.passes()).toBe(true);
  });
});

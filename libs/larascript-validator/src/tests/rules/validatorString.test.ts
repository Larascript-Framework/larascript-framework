import RequiredRule from "@/validator/rules/RequiredRule.js";
import StringRule from "@/validator/rules/StringRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe, it } from "@jest/globals";

describe("test validation", () => {
  it("validates string input successfully", async () => {
    const validator = new Validator({
      name: [new StringRule()],
    });
    const result = await validator.validate({
      name: "John Doe",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails validation for non-string input", async () => {
    const validator = new Validator({
      age: [new StringRule()],
    });
    const result = await validator.validate({
      age: 25,
    });

    expect(result.passes()).toBe(false);
  });

  it("passes validation when field is empty and not required", async () => {
    const validator = new Validator({
      optional: [new StringRule()],
    });
    const result = await validator.validate({
      optional: "",
    });

    expect(result.passes()).toBe(true);
  });

  it("passes validation with both Required and String rules", async () => {
    const validator = new Validator({
      username: [new RequiredRule(), new StringRule()],
    });
    const result = await validator.validate({
      username: "testuser",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails validation with custom message", async () => {
    const validator = new Validator(
      {
        title: [new StringRule()],
      },
      {
        "title.string": "The title field must be text.",
      },
    );
    const result = await validator.validate({
      title: 123,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      title: ["The title field must be text."],
    });
  });

  it("handles undefined values correctly", async () => {
    const validator = new Validator({
      name: [new StringRule()],
    });
    const result = await validator.validate({});

    expect(result.passes()).toBe(false);
  });
});

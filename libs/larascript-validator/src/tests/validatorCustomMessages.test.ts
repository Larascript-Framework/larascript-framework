import { RequiredRule, StringRule, Validator } from "@/validator/index.js";
import IsNumber from "@/validator/rules/NumberRule.js";
import { describe } from "@jest/globals";

describe("test validation", () => {
  test("validation fails with custom messages", async () => {
    const result = await Validator.make(
      {
        name: [new RequiredRule(), new StringRule()],
      },
      {
        "name.required": "This is a custom validation message (required)",
        "name.string": "This is a custom validation message (string)",
      },
    ).validate({
      name: null,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: [
        "This is a custom validation message (required)",
        "This is a custom validation message (string)",
      ],
    });
  });

  test("validation passes with valid data", async () => {
    const result = await Validator.make(
      {
        name: [new RequiredRule(), new StringRule()],
      },
      {
        "name.required": "Name field is required",
        "name.string": "Name must be a string",
      },
    ).validate({
      name: "John Doe",
    });

    expect(result.passes()).toBe(true);
    expect(result.errors()).toEqual({});
  });

  test("validation with multiple fields and custom messages", async () => {
    const result = await Validator.make(
      {
        name: [new RequiredRule(), new StringRule()],
        age: [new RequiredRule(), new IsNumber()],
      },
      {
        "name.required": "Name is required",
        "name.string": "Name must be a string",
        "age.required": "Age is required",
        "age.number": "Age must be a number",
      },
    ).validate({
      name: null,
      age: "not a number",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["Name is required", "Name must be a string"],
      age: ["Age must be a number"],
    });
  });

  test("validation with missing custom message falls back to default", async () => {
    const result = await Validator.make(
      {
        name: [new RequiredRule(), new StringRule()],
      },
      {
        "name.required": "Name is required",
        // No custom message for is_string
      },
    ).validate({
      name: null,
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      name: ["Name is required", "The name field must be a string."],
    });
  });

  test("validation with partial data and custom messages", async () => {
    const result = await Validator.make(
      {
        name: [new RequiredRule(), new StringRule()],
        email: [new RequiredRule(), new StringRule()],
      },
      {
        "name.required": "Name field is mandatory",
        "email.required": "Email field is mandatory",
      },
    ).validate({
      name: "John Doe",
      // email missing
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      email: ["Email field is mandatory", "The email field must be a string."],
    });
  });
});

import EmailRule from "@/validator/rules/EmailRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test email validation rule", () => {
  it("passes for valid email addresses", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: "test@example.com",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails for invalid email addresses", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: "invalid-email",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      email: ["The email field must be a valid email address."],
    });
  });

  it("fails when value contains spaces", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: "test @ example.com",
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is not a string", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: 123,
    });

    expect(result.passes()).toBe(false);
  });

  it("passes for email with subdomains", async () => {
    const validator = new Validator({
      email: [new EmailRule()],
    });
    const result = await validator.validate({
      email: "test@sub.example.com",
    });

    expect(result.passes()).toBe(true);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        email: [new EmailRule()],
      },
      {
        "email.email": "Please provide a valid email address",
      },
    );
    const result = await validator.validate({
      email: "invalid-email",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      email: ["Please provide a valid email address"],
    });
  });
});

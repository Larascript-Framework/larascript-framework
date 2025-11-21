import UuidRule from "@/validator/rules/UuidRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test uuid validation rule", () => {
  it("passes for valid UUID v4", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: "123e4567-e89b-42d3-a456-556642440000",
    });

    expect(result.passes()).toBe(true);
  });

  it("fails for invalid UUID format", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: "invalid-uuid",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      uuid: ["The uuid field must be a valid UUID."],
    });
  });

  it("fails for UUID with invalid version", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: "123e4567-e89b-12d3-a456-556642440000",
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is not a string", async () => {
    const validator = new Validator({
      uuid: [new UuidRule()],
    });
    const result = await validator.validate({
      uuid: 123,
    });

    expect(result.passes()).toBe(false);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        uuid: [new UuidRule()],
      },
      {
        "uuid.uuid": "Please provide a valid UUID",
      },
    );
    const result = await validator.validate({
      uuid: "invalid-uuid",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      uuid: ["Please provide a valid UUID"],
    });
  });
});

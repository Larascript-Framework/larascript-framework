import EnumRule from "@/validator/rules/EnumRule.js";
import NullableRule from "@/validator/rules/NullableRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe, expect, it } from "@jest/globals";

describe("test enum validation rule", () => {
  it("should pass when value is in enum list", async () => {
    const validator = Validator.make({
      field: [new EnumRule({ values: ["test", "example", "value"] })],
    });

    const result = validator.validate({
      field: "test",
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail when value is not in enum list", async () => {
    const validator = Validator.make({
      field: [new EnumRule({ values: ["test", "example", "value"] })],
    });

    const result = validator.validate({
      field: "invalid",
    });
    expect((await result).passes()).toBe(false);
  });

  it("should pass with case-insensitive matching when enabled", async () => {
    const validator = Validator.make({
      field: [
        new EnumRule({
          values: ["test", "example", "value"],
          caseInsensitive: true,
        }),
      ],
    });

    const result = validator.validate({
      field: "TEST",
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail with case-insensitive matching when disabled", async () => {
    const validator = Validator.make({
      field: [
        new EnumRule({
          values: ["test", "example", "value"],
          caseInsensitive: false,
        }),
      ],
    });

    const result = validator.validate({
      field: "TEST",
    });
    expect((await result).passes()).toBe(false);
  });

  it("should pass with numeric values", async () => {
    const validator = Validator.make({
      field: [new EnumRule({ values: [1, 2, 3] })],
    });

    const result = validator.validate({
      field: 1,
    });
    expect((await result).passes()).toBe(true);
  });

  it("should pass when value is null and nullable", async () => {
    const validator = Validator.make({
      field: [
        new NullableRule(),
        new EnumRule({ values: ["test", "example", "value"] }),
      ],
    });

    const result = validator.validate({
      field: null,
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail when value is undefined", async () => {
    const validator = Validator.make({
      field: [new EnumRule({ values: ["test", "example", "value"] })],
    });

    const result = validator.validate({
      field: undefined,
    });
    expect((await result).passes()).toBe(false);
  });

  it("should pass when value is empty string and nullable", async () => {
    const validator = Validator.make({
      field: [
        new NullableRule(),
        new EnumRule({ values: ["test", "example", "value"] }),
      ],
    });

    const result = validator.validate({
      field: "",
    });
    expect((await result).passes()).toBe(true);
  });

  it("should pass when value is an array of strings", async () => {
    const validator = Validator.make({
      field: [
        new NullableRule(),
        new EnumRule({ values: ["test", "example", "value"] }),
      ],
    });

    const result = validator.validate({
      field: ["test", "value"],
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail when value is an array of strings with unexpected value", async () => {
    const validator = Validator.make({
      field: [
        new NullableRule(),
        new EnumRule({ values: ["test", "example", "value"] }),
      ],
    });

    const result = validator.validate({
      field: ["test", "badValue"],
    });
    expect((await result).passes()).toBe(false);
  });
});

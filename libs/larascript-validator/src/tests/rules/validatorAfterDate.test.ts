import AfterDateRule from "@/validator/rules/AfterDateRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe, expect, it } from "@jest/globals";

describe("test after date validation rule", () => {
  it("should pass when value is after the specified date", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      field: [new AfterDateRule({ date: beforeDate })],
    });

    const result = validator.validate({
      field: new Date("2024-02-01"),
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail when value is before the specified date", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      field: [new AfterDateRule({ date: beforeDate })],
    });

    const result = validator.validate({
      field: new Date("2023-12-31"),
    });
    expect((await result).passes()).toBe(false);
  });

  it("should pass when value is a well formatted date string", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      field: [new AfterDateRule({ date: beforeDate })],
    });

    const result = validator.validate({
      field: "2024-02-01",
    });
    expect((await result).passes()).toBe(true);
  });

  it("should fail when value is a poorly formatted date string", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      field: [new AfterDateRule({ date: beforeDate })],
    });

    const result = validator.validate({
      field: "01-02-2024",
    });
    expect((await result).passes()).toBe(false);
  });

  it("should fail when value is not a Date instance", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      field: [new AfterDateRule({ date: beforeDate })],
    });

    const result = validator.validate({
      field: 123,
    });
    expect((await result).passes()).toBe(false);
  });

  it("should pass when attribute is provided to check another date field", async () => {
    const beforeDate = new Date("2024-01-01");

    const validator = Validator.make({
      endDate: [new AfterDateRule({ attribute: "startDate" })],
    });

    const result = validator.validate({
      startDate: beforeDate,
      endDate: new Date("2024-02-01"),
    });
    expect((await result).passes()).toBe(true);
  });
});

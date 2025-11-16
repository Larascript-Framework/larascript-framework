import DateRule from "@/validator/rules/DateRule.js";
import Validator from "@/validator/service/Validator.js";
import { describe } from "@jest/globals";

describe("test date validation rule", () => {
  it("passes for valid ISO date strings", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });

    const validDates = [
      "2024-03-14",
      "2024-03-14T12:00:00Z",
      "2024-03-14T12:00:00.000Z",
      "2024-03-14T12:00:00+01:00",
    ];

    for (const date of validDates) {
      const result = await validator.validate({ date });
      expect(result.passes()).toBe(true);
    }
  });

  it("passes for valid date string formats", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });

    const validDates = [
      "March 14, 2024",
      "14 Mar 2024",
      "2024/03/14",
      "03/14/2024",
    ];

    for (const date of validDates) {
      const result = await validator.validate({ date });
      expect(result.passes()).toBe(true);
    }
  });

  it("fails for invalid date strings", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });

    const invalidDates = [
      "not a date",
      "2024-13-45",
      "2024/13/45",
      "Invalid Date",
      "13/14/2024", // Invalid month
    ];

    for (const date of invalidDates) {
      const result = await validator.validate({ date });
      if (result.passes()) {
        console.log("Date", date);
      }
      expect(result.passes()).toBe(false);
      expect(result.errors()).toEqual({
        date: ["The date must be a valid date."],
      });
    }
  });

  it("fails when value is not a string", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });
    const result = await validator.validate({
      date: { invalid: "object" },
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      date: ["The date must be a valid date."],
    });
  });

  it("fails when value is null", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });
    const result = await validator.validate({
      date: null,
    });

    expect(result.passes()).toBe(false);
  });

  it("fails when value is undefined", async () => {
    const validator = new Validator({
      date: [new DateRule()],
    });
    const result = await validator.validate({
      date: undefined,
    });

    expect(result.passes()).toBe(false);
  });

  it("returns custom error message when validation fails", async () => {
    const validator = new Validator(
      {
        date: [new DateRule()],
      },
      {
        "date.date": "Please provide a valid date",
      },
    );
    const result = await validator.validate({
      date: "invalid date",
    });

    expect(result.passes()).toBe(false);
    expect(result.errors()).toEqual({
      date: ["Please provide a valid date"],
    });
  });
});

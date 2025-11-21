import { DotNotationDataExtrator } from "@/dotNotationExtractor/index.js";
import { describe, expect, test } from "@jest/globals";

describe("DotNotationDataExtractor", () => {
  test("should extract simple key value", () => {
    const data = { name: "John" };
    const result = DotNotationDataExtrator.reduceOne(data, "name");
    expect(result["name"]).toBe("John");
  });

  test("should extract nested value", () => {
    const data = {
      user: {
        name: "John",
        email: "john@example.com",
      },
    };
    const result = DotNotationDataExtrator.reduceOne(data, "user.name");
    expect(result["user.name"]).toBe("John");
  });

  test("should extract multiple values", () => {
    const data = {
      user: {
        name: "John",
        email: "john@example.com",
      },
    };
    const result = DotNotationDataExtrator.reduceMany(data, [
      "user.name",
      "user.email",
    ]);
    expect(result).toEqual({
      "user.name": "John",
      "user.email": "john@example.com",
    });
  });

  test("should handle array indexing", () => {
    const data = {
      users: [{ name: "John" }, { name: "Jane" }],
    };
    const result = DotNotationDataExtrator.reduceOne(data, "users.0.name");
    expect(result["users.0.name"]).toBe("John");
  });

  test("should handle wildcard array extraction", () => {
    const data = {
      users: [{ name: "John" }, { name: "Jane" }],
    };
    const result = DotNotationDataExtrator.reduceOne(data, "users.*.name");
    expect(result["users.*.name"]).toEqual(["John", "Jane"]);
  });

  test("should handle nested arrays with wildcards", () => {
    const data = {
      departments: [
        {
          employees: [{ name: "John" }, { name: "Jane" }],
        },
        {
          employees: [{ name: "Bob" }, { name: "Alice" }],
        },
      ],
    };
    const result = DotNotationDataExtrator.reduceOne(
      data,
      "departments.*.employees.*.name",
    );
    expect(result["departments.*.employees.*.name"]).toEqual([
      "John",
      "Jane",
      "Bob",
      "Alice",
    ]);
  });

  test("should return undefined for non-existent paths", () => {
    const data = { name: "John" };
    const result = DotNotationDataExtrator.reduceOne(data, "age");
    expect(result["age"]).toBeUndefined();
  });

  test("should handle empty data", () => {
    const data = {};
    const result = DotNotationDataExtrator.reduceOne(data, "name");
    expect(result["name"]).toBeUndefined();
  });

  test("should handle null values", () => {
    const data = {
      user: {
        name: null,
      },
    };
    const result = DotNotationDataExtrator.reduceOne(data, "user.name");
    expect(result["user.name"]).toBeNull();
  });

  test("should handle mixed array and object paths", () => {
    const data = {
      teams: [
        {
          name: "Team A",
          members: {
            active: [{ name: "John" }, { name: "Jane" }],
          },
        },
      ],
    };
    const result = DotNotationDataExtrator.reduceOne(
      data,
      "teams.0.members.active.*.name",
    );
    expect(result["teams.0.members.active.*.name"]).toEqual(["John", "Jane"]);
  });
});

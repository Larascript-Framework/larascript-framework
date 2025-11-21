import { describe, expect, test } from "@jest/globals";
import { validateUuid } from "../../utils/validateUuid.js";

describe("validateUuid", () => {
  describe("valid UUIDs", () => {
    test("should not throw for valid UUID v4", () => {
      expect(() =>
        validateUuid("123e4567-e89b-42d3-a456-556642440000"),
      ).not.toThrow();
      expect(() =>
        validateUuid("550e8400-e29b-41d4-a716-446655440000"),
      ).not.toThrow();
    });

    test("should handle uppercase UUIDs", () => {
      expect(() =>
        validateUuid("123E4567-E89B-42D3-A456-556642440000"),
      ).not.toThrow();
    });

    test("should handle mixed case UUIDs", () => {
      expect(() =>
        validateUuid("123e4567-E89b-42d3-A456-556642440000"),
      ).not.toThrow();
    });
  });

  describe("invalid UUIDs", () => {
    test("should throw error for invalid UUID formats", () => {
      expect(() => validateUuid("not-a-uuid")).toThrow("Invalid UUID format");
      expect(() =>
        validateUuid("123e4567-e89b-12d3-a456-556642440000"),
      ).toThrow("Invalid UUID format"); // Wrong version
      expect(() =>
        validateUuid("123e4567-e89b-42d3-c456-556642440000"),
      ).toThrow("Invalid UUID format"); // Wrong variant
      expect(() => validateUuid("123e4567e89b42d3a456556642440000")).toThrow(
        "Invalid UUID format",
      ); // No hyphens
    });

    test("should throw error for non-string values", () => {
      expect(() => validateUuid(123)).toThrow("Invalid UUID format");
      expect(() => validateUuid(true)).toThrow("Invalid UUID format");
      expect(() => validateUuid({})).toThrow("Invalid UUID format");
      expect(() => validateUuid([])).toThrow("Invalid UUID format");
      expect(() => validateUuid(() => {})).toThrow("Invalid UUID format");
    });

    test("should throw error for null and undefined", () => {
      expect(() => validateUuid(null)).toThrow("Invalid UUID format");
      expect(() => validateUuid(undefined)).toThrow("Invalid UUID format");
    });

    test("should throw error for empty string", () => {
      expect(() => validateUuid("")).toThrow("Invalid UUID format");
    });
  });

  describe("error message", () => {
    test("should throw with correct error message", () => {
      try {
        validateUuid("invalid-uuid");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Invalid UUID format");
      }
    });
  });
});

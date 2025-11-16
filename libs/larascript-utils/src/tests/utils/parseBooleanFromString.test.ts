import { describe, expect, test } from "@jest/globals";
import { parseBooleanFromString } from "../../utils/parseBooleanFromString.js";

describe("parseBooleanFromString", () => {
  describe("with defined values", () => {
    test("should return true for 'true' string", () => {
      expect(parseBooleanFromString("true", "false")).toBe(true);
    });

    test("should return false for 'false' string", () => {
      expect(parseBooleanFromString("false", "true")).toBe(false);
    });

    test("should return false for any other string", () => {
      expect(parseBooleanFromString("yes", "false")).toBe(false);
      expect(parseBooleanFromString("no", "false")).toBe(false);
      expect(parseBooleanFromString("1", "false")).toBe(false);
      expect(parseBooleanFromString("0", "false")).toBe(false);
      expect(parseBooleanFromString("", "false")).toBe(false);
    });
  });

  describe("with undefined values", () => {
    test("should return true when defaultValue is 'true'", () => {
      expect(parseBooleanFromString(undefined, "true")).toBe(true);
    });

    test("should return false when defaultValue is 'false'", () => {
      expect(parseBooleanFromString(undefined, "false")).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("should handle empty string", () => {
      expect(parseBooleanFromString("", "false")).toBe(false);
    });

    test("should handle whitespace strings", () => {
      expect(parseBooleanFromString("   ", "false")).toBe(false);
    });

    test("should handle case sensitivity", () => {
      expect(parseBooleanFromString("TRUE", "false")).toBe(false);
      expect(parseBooleanFromString("True", "false")).toBe(false);
      expect(parseBooleanFromString("FALSE", "false")).toBe(false);
      expect(parseBooleanFromString("False", "false")).toBe(false);
    });
  });
});

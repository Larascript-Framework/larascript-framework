import { describe, expect, test } from "@jest/globals";
import { forceString } from "../../utils/forceString.js";

describe("forceString", () => {
  describe("string values", () => {
    test("should return string as is", () => {
      expect(forceString("hello")).toBe("hello");
      expect(forceString("")).toBe("");
      expect(forceString("123")).toBe("123");
    });
  });

  describe("number values", () => {
    test("should convert numbers to strings", () => {
      expect(forceString(42)).toBe("42");
      expect(forceString(0)).toBe("0");
      expect(forceString(-123)).toBe("-123");
      expect(forceString(3.14)).toBe("3.14");
      expect(forceString(Infinity)).toBe("Infinity");
      expect(forceString(-Infinity)).toBe("-Infinity");
      expect(forceString(NaN)).toBe("NaN");
    });
  });

  describe("boolean values", () => {
    test("should convert booleans to strings", () => {
      expect(forceString(true)).toBe("true");
      expect(forceString(false)).toBe("false");
    });
  });

  describe("null and undefined", () => {
    test("should convert null and undefined to strings", () => {
      expect(forceString(null)).toBe("null");
      expect(forceString(undefined)).toBe("undefined");
    });
  });

  describe("objects", () => {
    test("should convert objects to strings", () => {
      expect(forceString({})).toBe("[object Object]");
      expect(forceString({ a: 1 })).toBe("[object Object]");
      expect(forceString([])).toBe("");
      expect(forceString([1, 2, 3])).toBe("1,2,3");
    });
  });

  describe("functions", () => {
    test("should convert functions to strings", () => {
      const testFn = () => "test";
      expect(forceString(testFn)).toContain('() => "test"');
    });
  });

  describe("symbols", () => {
    test("should convert symbols to strings", () => {
      const sym = Symbol("test");
      expect(forceString(sym)).toBe("Symbol(test)");
    });
  });
});

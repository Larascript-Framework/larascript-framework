import { BaseCastable } from "@/casts/BaseCastable.js";
import { Castable } from "@/casts/Castable.js";
import { CastException } from "@/casts/CastException.js";
import { IHasCastableConcern, TCastableType } from "@/casts/types.t.js";
import { beforeAll, describe } from "@jest/globals";

describe("HasCastableConcern Tests", () => {
  let castable: IHasCastableConcern;

  beforeAll(async () => {
    castable = new Castable({ returnNullOnException: false });
  });

  describe("getCastFromObject", () => {
    class TestClass extends BaseCastable {
      casts: Record<string, TCastableType> = {
        test: "string",
      };

      data = {
        age: "18",
        name: "John",
        books: ["Book 1"],
        createdAt: new Date(),
      };
    }

    const testClass = new TestClass();
    testClass.data = testClass.getCastFromObject(testClass.data);
  });

  describe("String Casting Tests", () => {
    it("should cast various types to string", () => {
      expect(castable.getCast(123, "string")).toBe("123");
      expect(castable.getCast(true, "string")).toBe("true");
      expect(castable.getCast([1, 2, 3], "string")).toBe("[1,2,3]");
      expect(castable.getCast({ a: 1 }, "string")).toBe('{"a":1}');

      const date = new Date("2024-01-01");
      expect(castable.getCast(date, "string")).toBe(date.toISOString());
    });
  });

  describe("Number Casting Tests", () => {
    it("should cast valid values to number", () => {
      expect(castable.getCast("123", "number")).toBe(123);
      expect(castable.getCast("123.45", "number")).toBe(123.45);
      expect(castable.getCast(true, "number")).toBe(1);
      expect(castable.getCast(false, "number")).toBe(0);
    });

    it("should throw CastException for invalid number strings", () => {
      expect(() => castable.getCast("abc", "number")).toThrow(CastException);
    });
  });

  describe("Boolean Casting Tests", () => {
    it("should cast strings to boolean", () => {
      expect(castable.getCast("true", "boolean")).toBe(true);
      expect(castable.getCast("false", "boolean")).toBe(false);
      expect(castable.getCast("1", "boolean")).toBe(true);
      expect(castable.getCast("0", "boolean")).toBe(false);
      expect(castable.getCast("yes", "boolean")).toBe(true);
      expect(castable.getCast("no", "boolean")).toBe(false);
    });

    it("should cast numbers to boolean", () => {
      expect(castable.getCast(1, "boolean")).toBe(true);
      expect(castable.getCast(0, "boolean")).toBe(false);
    });

    it("should throw CastException for invalid boolean strings", () => {
      expect(() => castable.getCast("invalid", "boolean")).toThrow(
        CastException,
      );
    });
  });

  describe("Array Casting Tests", () => {
    it("should cast to array", () => {
      expect(castable.getCast('["a","b"]', "array")).toEqual(["a", "b"]);
      expect(castable.getCast(new Set([1, 2]), "array")).toEqual([1, 2]);
      expect(castable.getCast(123, "array")).toEqual([123]);
      expect(() => castable.getCast("invalid json", "array")).toThrow(
        CastException,
      );
    });
  });

  describe("Object Casting Tests", () => {
    it("should cast to object", () => {
      expect(castable.getCast('{"a":1}', "object")).toEqual({ a: 1 });
      expect(castable.getCast([1, 2], "object")).toEqual({ "0": 1, "1": 2 });
    });

    it("should throw CastException for invalid JSON strings", () => {
      expect(() => castable.getCast("invalid json", "object")).toThrow(
        CastException,
      );
    });
  });

  describe("Date Casting Tests", () => {
    it("should cast to date", () => {
      const date = new Date("2024-01-01");
      expect(castable.getCast("2024-01-01", "date")).toEqual(date);
      expect(castable.getCast(date.getTime(), "date")).toEqual(date);
      expect(castable.getCast(date, "date")).toEqual(date);
    });

    it("should throw CastException for invalid dates", () => {
      expect(() => castable.getCast("invalid date", "date")).toThrow(
        CastException,
      );
    });
  });

  describe("Integer Casting Tests", () => {
    it("should cast to integer", () => {
      expect(castable.getCast("123", "integer")).toBe(123);
      expect(castable.getCast("123.45", "integer")).toBe(123);
      expect(castable.getCast(123.45, "integer")).toBe(123);
    });

    it("should throw CastException for invalid integers", () => {
      expect(() => castable.getCast("abc", "integer")).toThrow(CastException);
    });
  });

  describe("Float Casting Tests", () => {
    it("should cast to float", () => {
      expect(castable.getCast("123.45", "float")).toBe(123.45);
      expect(castable.getCast(123, "float")).toBe(123.0);
    });

    it("should throw CastException for invalid floats", () => {
      expect(() => castable.getCast("abc", "float")).toThrow(CastException);
    });
  });

  describe("BigInt Casting Tests", () => {
    it("should cast to BigInt", () => {
      expect(castable.getCast("123", "bigint")).toBe(BigInt(123));
      expect(castable.getCast(123, "bigint")).toBe(BigInt(123));
    });

    it("should throw CastException for invalid BigInt values", () => {
      expect(() => castable.getCast("abc", "bigint")).toThrow(CastException);
      expect(() => castable.getCast({}, "bigint")).toThrow(CastException);
    });
  });

  describe("Map Casting Tests", () => {
    it("should handle Map casting", () => {
      const map = new Map([["a", 1]]);
      expect(castable.getCast(map, "map")).toBe(map);
    });

    it("should throw CastException for invalid Map conversions", () => {
      expect(() => castable.getCast({}, "map")).toThrow(CastException);
    });
  });

  describe("Set Casting Tests", () => {
    it("should cast to Set", () => {
      expect(castable.getCast([1, 2, 3], "set")).toEqual(new Set([1, 2, 3]));
      expect(castable.getCast(1, "set")).toEqual(new Set([1]));
    });
  });

  describe("Symbol Casting Tests", () => {
    it("should cast to Symbol", () => {
      const sym = castable.getCast<symbol>("test", "symbol");
      expect(typeof sym).toBe("symbol");
      expect(sym.toString()).toBe("Symbol(test)");
    });
  });

  describe("Null and Undefined Handling Tests", () => {
    it("should handle null values correctly", () => {
      expect(castable.getCast(null, "null")).toBeNull();
      expect(() => castable.getCast(null, "string")).toThrow(CastException);
    });

    it("should handle undefined values correctly", () => {
      expect(castable.getCast(undefined, "undefined")).toBeUndefined();
      expect(() => castable.getCast(undefined, "string")).toThrow(
        CastException,
      );
    });
  });

  describe("Invalid Type Tests", () => {
    it("should throw CastException for invalid types", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => castable.getCast("test", "invalid" as any)).toThrow(
        CastException,
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty values", () => {
      expect(castable.getCast("", "string")).toBe("");
      expect(castable.getCast([], "array")).toEqual([]);
      expect(castable.getCast({}, "object")).toEqual({});
    });

    it("should handle special characters", () => {
      expect(castable.getCast("§±!@#$%^&*()", "string")).toBe("§±!@#$%^&*()");
    });
  });
});

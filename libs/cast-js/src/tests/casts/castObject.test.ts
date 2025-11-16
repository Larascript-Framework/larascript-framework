import { BaseCastable } from "@/casts/BaseCastable.js";
import { CastException } from "@/casts/CastException.js";
import { TCastableType } from "@/casts/types.t.js";
import { describe } from "@jest/globals";

describe("HasCastableConcern Tests", () => {
  describe("getCastFromObject", () => {
    describe("basic type casting", () => {
      interface TestData {
        age: number;
        isActive: boolean;
        joinDate: Date;
        score: number;
        rank: number;
        items: string[];
        settings: { theme: string };
        userId: bigint;
        userType: symbol;
        name: string;
        books: string[];
        createdAt: Date;
      }

      class TestClass extends BaseCastable {
        casts: Record<string, TCastableType> = {
          age: "number",
          isActive: "boolean",
          joinDate: "date",
          score: "float",
          rank: "integer",
          items: "array",
          settings: "object",
          userId: "bigint",
          userType: "symbol",
        };

        data = {
          age: "25",
          isActive: "1",
          joinDate: "2024-01-01",
          score: "91.5",
          rank: "1",
          items: '["item1", "item2"]',
          settings: '{"theme":"dark"}',
          userId: "1234567890",
          userType: "premium",
          name: "John",
          books: ["Book 1"],
          createdAt: new Date(),
        };
      }

      const testClass = new TestClass();
      const result = testClass.getCastFromObject<TestData>(testClass.data);

      it("should cast values according to casts property", () => {
        expect(typeof result.age).toBe("number");
        expect(result.age).toBe(25);

        expect(typeof result.isActive).toBe("boolean");
        expect(result.isActive).toBe(true);

        expect(result.joinDate).toBeInstanceOf(Date);
        expect(result.joinDate.toISOString()).toContain("2024-01-01");

        expect(typeof result.score).toBe("number");
        expect(result.score).toBe(91.5);

        expect(typeof result.rank).toBe("number");
        expect(result.rank).toBe(1);
        expect(Number.isInteger(result.rank)).toBe(true);

        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items).toEqual(["item1", "item2"]);

        expect(typeof result.settings).toBe("object");
        expect(result.settings).toEqual({ theme: "dark" });

        expect(typeof result.userId).toBe("bigint");
        expect(result.userId.toString()).toBe("1234567890");

        expect(typeof result.userType).toBe("symbol");
        expect(result.userType.toString()).toBe("Symbol(premium)");
      });

      it("should not cast properties not defined in casts", () => {
        expect(typeof result.name).toBe("string");
        expect(result.name).toBe("John");

        expect(Array.isArray(result.books)).toBe(true);
        expect(result.books).toEqual(["Book 1"]);

        expect(result.createdAt).toBeInstanceOf(Date);
      });
    });

    describe("error handling", () => {
      interface InvalidData {
        age: number;
        joinDate: Date;
        score: number;
      }

      class InvalidCastClass extends BaseCastable {
        casts: Record<string, TCastableType> = {
          age: "number",
          joinDate: "date",
          score: "float",
        };

        data = {
          age: "not a number",
          joinDate: "invalid date",
          score: "not a float",
        };
      }

      it("should throw CastException for invalid cast values", () => {
        const invalidClass = new InvalidCastClass();
        expect(() => {
          invalidClass.getCastFromObject<InvalidData>(invalidClass.data);
        }).toThrow(CastException);
      });
    });

    describe("null and undefined handling", () => {
      interface NullableData {
        nullValue: null;
        undefinedValue: undefined;
        optionalNumber: number;
      }

      class NullableClass extends BaseCastable {
        casts: Record<string, TCastableType> = {
          nullValue: "null",
          undefinedValue: "undefined",
          optionalNumber: "number",
        };

        data = {
          nullValue: null,
          undefinedValue: undefined,
          optionalNumber: null,
        };
      }

      it("should handle null and undefined values correctly", () => {
        const nullableClass = new NullableClass();

        // Test null and undefined separately first
        const validData = {
          nullValue: null,
          undefinedValue: undefined,
        };

        const result: NullableData = nullableClass.getCastFromObject(validData);
        expect(result.nullValue).toBeNull();
        expect(result.undefinedValue).toBeUndefined();
      });

      it("should throw CastException when trying to cast null to number", () => {
        const nullableClass = new NullableClass();

        expect(() => {
          nullableClass.getCastFromObject<NullableData>(nullableClass.data);
        }).toThrow(CastException);
      });
    });

    describe("empty and invalid casts", () => {
      interface EmptyData {
        name: string;
        age: string;
      }

      class EmptyCastClass extends BaseCastable {
        casts: Record<string, TCastableType> = {};

        data = {
          name: "John",
          age: "25",
        };
      }

      it("should return original data when no casts are defined", () => {
        const emptyClass = new EmptyCastClass();
        const result = emptyClass.getCastFromObject<EmptyData>(emptyClass.data);

        expect(result).toEqual(emptyClass.data);
      });

      interface InvalidTypeData {
        age: unknown;
      }

      class InvalidTypeCastClass extends BaseCastable {
        casts: Record<string, TCastableType> = {
          age: "invalid" as TCastableType,
        };

        data = {
          age: "25",
        };
      }

      it("should throw CastException for invalid cast types", () => {
        const invalidClass = new InvalidTypeCastClass();
        expect(() => {
          invalidClass.getCastFromObject<InvalidTypeData>(invalidClass.data);
        }).toThrow(CastException);
      });
    });

    describe("performance with many properties", () => {
      interface LargeData {
        prop1: number;
        prop2: string;
        prop3: boolean;
        nonCast1: string;
        nonCast2: string;
        nonCast3: string;
      }

      class LargeDataClass extends BaseCastable {
        casts: Record<string, TCastableType> = {
          prop1: "number",
          prop2: "string",
          prop3: "boolean",
        };

        data = {
          prop1: "1",
          prop2: 2,
          prop3: "true",
          nonCast1: "value1",
          nonCast2: "value2",
          nonCast3: "value3",
        };
      }

      it("should handle large objects efficiently", () => {
        const largeClass = new LargeDataClass();
        const result = largeClass.getCastFromObject<LargeData>(largeClass.data);

        expect(typeof result.prop1).toBe("number");
        expect(typeof result.prop2).toBe("string");
        expect(typeof result.prop3).toBe("boolean");
        expect(result.nonCast1).toBe("value1");
      });
    });
  });
});

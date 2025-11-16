import { describe, expect, test } from "@jest/globals";
import { deepClone } from "../../utils/deepClone.js";

describe("deepClone", () => {
  describe("primitive values", () => {
    test("should clone primitive values", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("hello")).toBe("hello");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });
  });

  describe("objects", () => {
    test("should deep clone objects", () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    test("should handle nested objects", () => {
      const original = {
        level1: {
          level2: {
            level3: { value: "deep" },
          },
        },
      };
      const cloned = deepClone(original);

      expect(cloned.level1.level2.level3.value).toBe("deep");
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
    });
  });

  describe("arrays", () => {
    test("should deep clone arrays", () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect(cloned[2]).not.toBe(original[2]);
    });

    test("should handle nested arrays", () => {
      const original = [
        [
          [1, 2],
          [3, 4],
        ],
        [5, 6],
      ];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned[0][0]).not.toBe(original[0][0]);
    });
  });

  describe("complex structures", () => {
    test("should handle mixed structures", () => {
      const original = {
        string: "hello",
        number: 42,
        boolean: true,
        null: null,
        array: [1, "two", { three: 3 }],
        object: {
          nested: [false, null, "deep"],
        },
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.array[2]).not.toBe(original.array[2]);
      expect(cloned.object.nested).not.toBe(original.object.nested);
    });
  });
});

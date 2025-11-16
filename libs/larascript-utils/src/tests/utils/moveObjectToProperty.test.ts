import { beforeEach, describe, expect, test } from "@jest/globals";
import { MoveObjectToProperty } from "../../utils/moveObjectToPropery.js";

describe("MoveObjectToProperty", () => {
  let formatter: MoveObjectToProperty;

  beforeEach(() => {
    formatter = new MoveObjectToProperty();
  });

  describe("addOption", () => {
    test("should add option to formatter", () => {
      formatter.addOption("department_name", "department");

      expect(formatter.formatterOptions).toHaveLength(1);
      expect(formatter.formatterOptions[0]).toEqual({
        column: "department_name",
        targetProperty: "department",
      });
    });

    test("should add multiple options", () => {
      formatter.addOption("department_name", "department");
      formatter.addOption("user_id", "user");

      expect(formatter.formatterOptions).toHaveLength(2);
      expect(formatter.formatterOptions[0]).toEqual({
        column: "department_name",
        targetProperty: "department",
      });
      expect(formatter.formatterOptions[1]).toEqual({
        column: "user_id",
        targetProperty: "user",
      });
    });
  });

  describe("format", () => {
    test("should format data with object properties", () => {
      formatter.addOption("department_name", "department");
      formatter.addOption("department_id", "department");

      const data = [
        {
          id: 1,
          name: "John",
          department_name: { name: "Engineering", code: "ENG" },
          department_id: { id: 100, type: "main" },
        },
      ];

      const result = formatter.format(data);

      expect(result).toEqual([
        {
          id: 1,
          name: "John",
          department: {
            name: "Engineering",
            code: "ENG",
            id: 100,
            type: "main",
          },
        },
      ]);
    });

    test("should handle non-object properties", () => {
      formatter.addOption("department_name", "department");

      const data = [
        {
          id: 1,
          name: "John",
          department_name: "Engineering",
        },
      ];

      const result = formatter.format(data);

      // Should not modify non-object properties
      expect(result).toEqual(data);
    });

    test("should handle empty array", () => {
      formatter.addOption("department_name", "department");

      const result = formatter.format([]);

      expect(result).toEqual([]);
    });
  });

  describe("handleArray", () => {
    test("should process array with options", () => {
      const options = [
        { column: "department_name", targetProperty: "department" },
        { column: "department_id", targetProperty: "department" },
      ];

      const data = [
        {
          id: 1,
          department_name: { name: "Engineering" },
          department_id: { id: 100 },
        },
      ];

      const result = formatter.handleArray(data, options);

      expect(result).toEqual([
        {
          id: 1,
          department: {
            name: "Engineering",
            id: 100,
          },
        },
      ]);
    });
  });

  describe("handleItem", () => {
    test("should merge object properties", () => {
      const item = {
        id: 1,
        department_name: { name: "Engineering", code: "ENG" },
        department_id: { id: 100, type: "main" },
      };

      const option = {
        column: "department_name",
        targetProperty: "department",
      };

      const result = formatter.handleItem(item, option);

      expect(result).toEqual({
        id: 1,
        department: {
          name: "Engineering",
          code: "ENG",
        },
        department_id: { id: 100, type: "main" },
      });
    });

    test("should handle non-object properties", () => {
      const item = {
        id: 1,
        department_name: "Engineering",
      };

      const option = {
        column: "department_name",
        targetProperty: "department",
      };

      const result = formatter.handleItem(item, option);

      expect(result).toEqual(item);
    });
  });
});

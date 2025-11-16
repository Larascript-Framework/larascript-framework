import { beforeEach, describe, expect, test } from "@jest/globals";
import { PrefixedPropertyGrouper } from "../../utils/prefixedPropertyGrouper.js";

describe("PrefixedPropertyGrouper", () => {
  let formatter: PrefixedPropertyGrouper;

  beforeEach(() => {
    formatter = new PrefixedPropertyGrouper();
  });

  describe("addOption", () => {
    test("should add option with correct prefix", () => {
      formatter.addOption("user", "userInfo");

      expect(formatter.formatterOptions).toHaveLength(1);
      expect(formatter.formatterOptions[0]).toEqual({
        columnPrefix: "user_",
        targetProperty: "userInfo",
        setTargetPropertyNullWhenObjectAllNullish: true,
      });
    });

    test("should add multiple options", () => {
      formatter.addOption("user", "userInfo");
      formatter.addOption("address", "addressInfo");

      expect(formatter.formatterOptions).toHaveLength(2);
      expect(formatter.formatterOptions[0].columnPrefix).toBe("user_");
      expect(formatter.formatterOptions[1].columnPrefix).toBe("address_");
    });
  });

  describe("format", () => {
    test("should group prefixed properties", () => {
      formatter.addOption("user", "user");
      formatter.addOption("address", "address");

      const data = [
        {
          user_id: 1,
          user_name: "John",
          address_street: "123 Main St",
          address_city: "Boston",
        },
      ];

      const result = formatter.format(data);

      expect(result).toEqual([
        {
          user: { id: 1, name: "John" },
          address: { street: "123 Main St", city: "Boston" },
        },
      ]);
    });

    test("should handle empty array", () => {
      formatter.addOption("user", "user");

      const result = formatter.format([]);

      expect(result).toEqual([]);
    });
  });

  describe("handleArray", () => {
    test("should process array with options", () => {
      const options = [
        { columnPrefix: "user_", targetProperty: "user" },
        { columnPrefix: "address_", targetProperty: "address" },
      ];

      const data = [
        {
          user_id: 1,
          user_name: "John",
          address_street: "123 Main St",
        },
      ];

      const result = formatter.handleArray(data, options);

      expect(result).toEqual([
        {
          user: { id: 1, name: "John" },
          address: { street: "123 Main St" },
        },
      ]);
    });
  });

  describe("handleItem", () => {
    test("should group prefixed properties into nested objects", () => {
      const item = {
        user_id: 1,
        user_name: "John",
        address_street: "123 Main St",
        address_city: "Boston",
      };

      const options = [
        { columnPrefix: "user_", targetProperty: "user" },
        { columnPrefix: "address_", targetProperty: "address" },
      ];

      const result = formatter.handleItem(item, options);

      expect(result).toEqual({
        user: { id: 1, name: "John" },
        address: { street: "123 Main St", city: "Boston" },
      });
    });

    test("should remove original prefixed properties", () => {
      const item = {
        user_id: 1,
        user_name: "John",
      };

      const options = [{ columnPrefix: "user_", targetProperty: "user" }];

      const result = formatter.handleItem(item, options);

      expect(result).not.toHaveProperty("user_id");
      expect(result).not.toHaveProperty("user_name");
      expect(result).toHaveProperty("user");
    });

    test("should handle null values with setTargetPropertyNullWhenObjectAllNullish", () => {
      const item = {
        user_id: null,
        user_name: null,
      };

      const options = [
        {
          columnPrefix: "user_",
          targetProperty: "user",
          setTargetPropertyNullWhenObjectAllNullish: true,
        },
      ];

      const result = formatter.handleItem(item, options);

      expect(result).toEqual({
        user: null,
      });
    });

    test("should not set null when setTargetPropertyNullWhenObjectAllNullish is false", () => {
      const item = {
        user_id: null,
        user_name: null,
      };

      const options = [
        {
          columnPrefix: "user_",
          targetProperty: "user",
          setTargetPropertyNullWhenObjectAllNullish: false,
        },
      ];

      const result = formatter.handleItem(item, options);

      expect(result).toEqual({
        user: { id: null, name: null },
      });
    });
  });
});

import { BaseConfig } from "@/base/BaseConfig.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("BaseConfig Tests", () => {
  let config: BaseConfig;

  beforeEach(() => {
    config = new BaseConfig();
  });

  describe("Configuration Management", () => {
    test("should initialize with undefined config", () => {
      const result = config.getConfig();
      expect(result).toBeUndefined();
    });

    test("should set and get string configuration", () => {
      const testConfig = "test configuration";
      config.setConfig(testConfig);

      const result = config.getConfig<string>();
      expect(result).toBe(testConfig);
    });

    test("should set and get object configuration", () => {
      const testConfig = {
        name: "test",
        value: 123,
        enabled: true,
      };
      config.setConfig(testConfig);

      const result = config.getConfig<typeof testConfig>();
      expect(result).toEqual(testConfig);
      expect(result.name).toBe("test");
      expect(result.value).toBe(123);
      expect(result.enabled).toBe(true);
    });

    test("should set and get array configuration", () => {
      const testConfig = [1, 2, 3, "test"];
      config.setConfig(testConfig);

      const result = config.getConfig<typeof testConfig>();
      expect(result).toEqual(testConfig);
      expect(Array.isArray(result)).toBe(true);
    });

    test("should set and get null configuration", () => {
      config.setConfig(null);

      const result = config.getConfig();
      expect(result).toBeNull();
    });

    test("should set and get undefined configuration", () => {
      config.setConfig(undefined);

      const result = config.getConfig();
      expect(result).toBeUndefined();
    });
  });

  describe("Type Safety", () => {
    test("should maintain type safety with generic getConfig", () => {
      const testConfig = {
        apiKey: "secret-key",
        timeout: 5000,
        retries: 3,
      };
      config.setConfig(testConfig);

      // TypeScript should ensure this returns the correct type
      const result = config.getConfig<typeof testConfig>();
      expect(typeof result.apiKey).toBe("string");
      expect(typeof result.timeout).toBe("number");
      expect(typeof result.retries).toBe("number");
    });

    test("should work with complex nested objects", () => {
      const testConfig = {
        database: {
          host: "localhost",
          port: 5432,
          credentials: {
            username: "user",
            password: "pass",
          },
        },
        features: {
          caching: true,
          logging: false,
        },
      };
      config.setConfig(testConfig);

      const result = config.getConfig<typeof testConfig>();
      expect(result.database.host).toBe("localhost");
      expect(result.database.credentials.username).toBe("user");
      expect(result.features.caching).toBe(true);
    });
  });

  describe("Configuration Updates", () => {
    test("should update existing configuration", () => {
      // Set initial config
      config.setConfig({ name: "initial" });
      expect(config.getConfig<{ name: string }>().name).toBe("initial");

      // Update config
      config.setConfig({ name: "updated", newField: "value" });
      const result = config.getConfig() as { name: string; newField?: string };
      expect(result.name).toBe("updated");
      expect(result.newField).toBe("value");
    });

    test("should replace entire configuration", () => {
      // Set complex config
      config.setConfig({
        complex: {
          nested: {
            value: "test",
          },
        },
      });

      // Replace with simple config
      config.setConfig("simple string");
      const result = config.getConfig<string>();
      expect(result).toBe("simple string");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty object configuration", () => {
      config.setConfig({});
      const result = config.getConfig() as object;
      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    test("should handle empty array configuration", () => {
      config.setConfig([]);
      const result = config.getConfig();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test("should handle zero and false values", () => {
      const testConfig = {
        zero: 0,
        falseValue: false,
        emptyString: "",
      };
      config.setConfig(testConfig);

      const result = config.getConfig<typeof testConfig>();
      expect(result.zero).toBe(0);
      expect(result.falseValue).toBe(false);
      expect(result.emptyString).toBe("");
    });

    test("should handle function values", () => {
      const testFunction = () => "test";
      config.setConfig(testFunction);

      const result = config.getConfig<typeof testFunction>();
      expect(typeof result).toBe("function");
      expect(result()).toBe("test");
    });
  });

  describe("Method Availability", () => {
    test("should have getConfig method", () => {
      expect(typeof config.getConfig).toBe("function");
    });

    test("should have setConfig method", () => {
      expect(typeof config.setConfig).toBe("function");
    });
  });
});

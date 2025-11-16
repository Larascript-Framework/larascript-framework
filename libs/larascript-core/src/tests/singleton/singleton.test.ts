/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseSingleton } from "@/base/index.js";
import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";

// Test service classes that extend BaseSingleton
class TestService extends BaseSingleton<{ name: string; value: number }> {
  public testMethod(): string {
    return "test method called";
  }
}

class AnotherService extends BaseSingleton<{ enabled: boolean }> {
  public anotherMethod(): boolean {
    return this.config?.enabled ?? false;
  }
}

class ServiceWithoutConfig extends BaseSingleton {
  public getDefaultValue(): string {
    return "default";
  }
}

describe("BaseSingleton Tests", () => {
  // Clear instances before each test to ensure isolation
  beforeEach(() => {
    // Clear the static instances map
    (BaseSingleton as any).instances.clear();
  });

  afterEach(() => {
    // Clear the static instances map after each test
    (BaseSingleton as any).instances.clear();
  });

  describe("Singleton Instance Management", () => {
    test("should create singleton instance on first getInstance call", () => {
      const instance1 = TestService.getInstance({ name: "test", value: 42 });
      const instance2 = TestService.getInstance({
        name: "different",
        value: 100,
      });

      expect(instance1).toBeInstanceOf(TestService);
      expect(instance2).toBeInstanceOf(TestService);
      expect(instance1).toBe(instance2); // Same instance
    });

    test("should return same instance for multiple getInstance calls", () => {
      const instance1 = TestService.getInstance();
      const instance2 = TestService.getInstance();
      const instance3 = TestService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });

    test("should maintain separate instances for different service classes", () => {
      const testInstance = TestService.getInstance();
      const anotherInstance = AnotherService.getInstance();

      expect(testInstance).toBeInstanceOf(TestService);
      expect(anotherInstance).toBeInstanceOf(AnotherService);
      expect(testInstance).not.toBe(anotherInstance);
    });

    test("should ignore config parameter on subsequent getInstance calls", () => {
      const instance1 = TestService.getInstance({ name: "first", value: 1 });
      const instance2 = TestService.getInstance({ name: "second", value: 2 });

      // Should return the same instance with the first config
      expect(instance1).toBe(instance2);
      expect(instance1.getConfig()).toEqual({ name: "first", value: 1 });
    });
  });

  describe("Configuration Management", () => {
    test("should store configuration passed to constructor", () => {
      const config = { name: "test service", value: 123 };
      const instance = TestService.getInstance(config);

      expect(instance.getConfig()).toEqual(config);
    });

    test("should handle null configuration", () => {
      const instance = TestService.getInstance(null);

      expect(instance.getConfig()).toBeNull();
    });

    test("should handle undefined configuration", () => {
      const instance = TestService.getInstance(undefined);

      expect(instance.getConfig()).toBeNull();
    });

    test("should work with service without config type", () => {
      const instance = ServiceWithoutConfig.getInstance();

      expect(instance.getConfig()).toBeNull();
      expect(instance.getDefaultValue()).toBe("default");
    });

    test("should maintain type safety for configuration", () => {
      const config = { enabled: true };
      const instance = AnotherService.getInstance(config);

      const retrievedConfig = instance.getConfig();
      expect(retrievedConfig).toEqual(config);
      expect(retrievedConfig?.enabled).toBe(true);
    });
  });

  describe("isInitialized Method", () => {
    test("should return false before first getInstance call", () => {
      expect(TestService.isInitialized()).toBe(false);
    });

    test("should return true after getInstance call", () => {
      TestService.getInstance();
      expect(TestService.isInitialized()).toBe(true);
    });

    test("should return false for uninitialized service classes", () => {
      expect(AnotherService.isInitialized()).toBe(false);
    });

    test("should return true for initialized service classes", () => {
      AnotherService.getInstance();
      expect(AnotherService.isInitialized()).toBe(true);
    });

    test("should maintain separate initialization states for different services", () => {
      expect(TestService.isInitialized()).toBe(false);
      expect(AnotherService.isInitialized()).toBe(false);

      TestService.getInstance();
      expect(TestService.isInitialized()).toBe(true);
      expect(AnotherService.isInitialized()).toBe(false);

      AnotherService.getInstance();
      expect(TestService.isInitialized()).toBe(true);
      expect(AnotherService.isInitialized()).toBe(true);
    });
  });

  describe("Instance Methods", () => {
    test("should allow calling instance methods", () => {
      const instance = TestService.getInstance();
      expect(instance.testMethod()).toBe("test method called");
    });

    test("should allow access to configuration in instance methods", () => {
      const config = { enabled: true };
      const instance = AnotherService.getInstance(config);
      expect(instance.anotherMethod()).toBe(true);
    });

    test("should handle null configuration in instance methods", () => {
      const instance = AnotherService.getInstance(null);
      expect(instance.anotherMethod()).toBe(false);
    });

    test("should work with services that don't use configuration", () => {
      const instance = ServiceWithoutConfig.getInstance();
      expect(instance.getDefaultValue()).toBe("default");
    });
  });

  describe("Type Safety", () => {
    test("should maintain type safety for service instances", () => {
      const instance = TestService.getInstance();

      // TypeScript should ensure these methods exist
      expect(typeof instance.testMethod).toBe("function");
      expect(typeof instance.getConfig).toBe("function");
    });

    test("should maintain type safety for configuration", () => {
      const config = { name: "typed", value: 999 };
      const instance = TestService.getInstance(config);

      const retrievedConfig = instance.getConfig();
      expect(retrievedConfig?.name).toBe("typed");
      expect(retrievedConfig?.value).toBe(999);
    });

    test("should work with different service types", () => {
      const testInstance = TestService.getInstance();
      const anotherInstance = AnotherService.getInstance();

      // Each should have their own specific methods
      expect(typeof testInstance.testMethod).toBe("function");
      expect(typeof anotherInstance.anotherMethod).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    test("should handle multiple service classes with same name pattern", () => {
      class ServiceA extends BaseSingleton {}
      class ServiceB extends BaseSingleton {}

      const instanceA = ServiceA.getInstance();
      const instanceB = ServiceB.getInstance();

      expect(instanceA).toBeInstanceOf(ServiceA);
      expect(instanceB).toBeInstanceOf(ServiceB);
      expect(instanceA).not.toBe(instanceB);
    });

    test("should handle services with complex configuration objects", () => {
      const complexConfig = {
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

      class ComplexService extends BaseSingleton<typeof complexConfig> {}
      const instance = ComplexService.getInstance(complexConfig);

      expect(instance.getConfig()).toEqual(complexConfig);
      expect(instance.getConfig()?.database.host).toBe("localhost");
    });

    test("should handle services with array configurations", () => {
      const arrayConfig = [1, 2, 3, "test"];

      class ArrayService extends BaseSingleton<typeof arrayConfig> {}
      const instance = ArrayService.getInstance(arrayConfig);

      expect(instance.getConfig()).toEqual(arrayConfig);
      expect(Array.isArray(instance.getConfig())).toBe(true);
    });

    test("should handle services with function configurations", () => {
      const functionConfig = () => "test function";

      class FunctionService extends BaseSingleton<typeof functionConfig> {}
      const instance = FunctionService.getInstance(functionConfig);
      const configResult = instance.getConfig()?.();

      expect(typeof instance.getConfig()).toBe("function");
      expect(configResult).toBe("test function");
    });
  });

  describe("Method Availability", () => {
    test("should have getInstance static method", () => {
      expect(typeof TestService.getInstance).toBe("function");
    });

    test("should have isInitialized static method", () => {
      expect(typeof TestService.isInitialized).toBe("function");
    });

    test("should have getConfig instance method", () => {
      const instance = TestService.getInstance();
      expect(typeof instance.getConfig).toBe("function");
    });
  });
});

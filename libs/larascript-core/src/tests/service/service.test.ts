import { BaseService } from "@/base/BaseService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

// Simple concrete implementation of BaseService for testing
class TestService extends BaseService<{ name: string; port: number }> {
  public getName(): string {
    return this.config?.name || "default";
  }

  public getPort(): number {
    return this.config?.port || 8080;
  }
}

describe("BaseService Tests", () => {
  let testService: TestService;

  beforeEach(() => {
    testService = new TestService();
  });

  describe("Service Initialization", () => {
    test("should initialize with null config by default", () => {
      expect(testService.getConfig()).toBeNull();
    });

    test("should initialize with provided config", () => {
      const config = { name: "test-service", port: 3000 };
      const serviceWithConfig = new TestService(config);

      expect(serviceWithConfig.getConfig()).toEqual(config);
    });

    test("should initialize with null config when explicitly passed", () => {
      const serviceWithNullConfig = new TestService(null);

      expect(serviceWithNullConfig.getConfig()).toBeNull();
    });
  });

  describe("Configuration Management", () => {
    test("should return correct config values", () => {
      const config = { name: "api-service", port: 5000 };
      const service = new TestService(config);

      expect(service.getConfig()).toEqual(config);
      expect(service.getName()).toBe("api-service");
      expect(service.getPort()).toBe(5000);
    });

    test("should return default values when config is null", () => {
      expect(testService.getName()).toBe("default");
      expect(testService.getPort()).toBe(8080);
    });
  });

  describe("Service Instance", () => {
    test("should be instance of Service", () => {
      expect(testService).toBeInstanceOf(BaseService);
    });

    test("should be instance of TestService", () => {
      expect(testService).toBeInstanceOf(TestService);
    });
  });
});

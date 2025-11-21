import ConsoleService from "@/console/service/ConsoleService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Console Service Test Suite", () => {
  let consoleService: ConsoleService;

  beforeEach(() => {
    consoleService = new ConsoleService();
  });

  describe("ConsoleService", () => {
    test("should create ConsoleService instance", () => {
      expect(consoleService).toBeInstanceOf(ConsoleService);
    });

    test("should have readerService method", () => {
      expect(typeof consoleService.readerService).toBe("function");
    });

    test("should have registerService method", () => {
      expect(typeof consoleService.registerService).toBe("function");
    });

    test("should have register method", () => {
      expect(typeof consoleService.register).toBe("function");
    });

    test("should return readerService when called", () => {
      const reader = consoleService.readerService([]);
      expect(reader).toBeDefined();
    });

    test("should return registerService when called", () => {
      const register = consoleService.registerService();
      expect(register).toBeDefined();
    });
  });
});

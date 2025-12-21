import { AppEnvironment } from "@/kernel/AppEnvironment.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("AppEnvironment Test Suite", () => {

  beforeEach(() => {
    AppEnvironment.reset()
  });

  describe("Instance", () => {
    test("should be able to create an instance", () => {
      AppEnvironment.create('dev')

      expect(AppEnvironment.env()).toBe('dev')
    })

    test("should not be able to get instance without creation", () => {
      expect(() => AppEnvironment.getInstance()).toThrow('AppEnvironment has not been created')
    })

    test("should not be able to create multiple instances", () => {
      AppEnvironment.create('prod')
      AppEnvironment.create('dev')

      expect(AppEnvironment.env()).toBe('prod')
    })
  });

  describe("reset", () => {
    test("should be able to reset", () => {
      AppEnvironment.create('dev')
      AppEnvironment.reset()

      expect(() => AppEnvironment.getInstance()).toThrow('AppEnvironment has not been created')
    })
  })
});

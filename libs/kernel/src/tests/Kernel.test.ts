import { KernelConfig } from "@/contracts/kernel.js";
import { Kernel } from "@/kernel/Kernel.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

const DEFAULT_CONFIG: KernelConfig = {
  environment: 'dev',
  providers: []
}

describe("Kernel Test Suite", () => {

  beforeEach(() => {
    Kernel.reset()
  });

  describe("Instance", () => {
    test("should be able to create an instance of the kernel", () => {
      const kernel = Kernel.create(DEFAULT_CONFIG, {});

      expect(kernel).toBeInstanceOf(Kernel)
    })

    test("should not be able to get the instance without creationg", () => {
      expect(() => Kernel.getInstance()).toThrow('Kernel has not been created')
    })

    test("should not be able to create multiple instances of the kernel", () => {
      Kernel.create(DEFAULT_CONFIG, {})
      const kernel = Kernel.getInstance();
      const kernel2 = Kernel.getInstance();

      expect(kernel).toBe(kernel2)
    })
  });

  describe("config and options", () => {
    test("should be able to get config", () => {
      const kernel = Kernel.create(DEFAULT_CONFIG, {})

      expect(kernel.getConfig().environment).toBe('dev')
    })

    test("should be able to get options", () => {
      const kernel = Kernel.create(DEFAULT_CONFIG, {
        shouldUseProvider: () => true
      })

      expect(typeof kernel.getOptions().shouldUseProvider).toBe('function')
    })
  })
});

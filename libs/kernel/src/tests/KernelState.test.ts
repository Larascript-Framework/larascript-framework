import { KernelLockedException } from "@/exceptions/KernelLockedException.js";
import { Kernel } from "@/kernel/Kernel.js";
import { KernelState } from "@/kernel/KernelState.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("KernelState Test Suite", () => {

  beforeEach(() => {
    Kernel.reset()
    Kernel.create({ providers: [], environment: 'dev' }, {})
    KernelState.reset()
  });

  describe("Instance", () => {
    test("should be able to create an instance", () => {
      const kernelState = KernelState.create()

      expect(kernelState instanceof KernelState)
    })

    test("should not be able to get the instance without creation", () => {-
      expect(() => KernelState.getInstance()).toThrow('KernelState has not been created')
    })

    test("should not be able to create multiple instances", () => {
      const kernelState = KernelState.create()
      const kernelState2 = KernelState.create()

      expect(kernelState === kernelState2).toBe(true)
    })
  });

  describe("setters and getters", () => {
    test("should be able to set ready providers", () => {
      KernelState.create()
      KernelState.addPreparedProvider('provider')

      expect(KernelState.preparedProviders().includes('provider')).toBe(true)
    })

    test("should be able to set ready providers", () => {
      KernelState.create()
      KernelState.addReadyProvider('provider')

      expect(KernelState.readyProviders().includes('provider')).toBe(true)
    })

    test("should be able to set definedProvidersCount", () => {
      KernelState.create()
      KernelState.setDefinedProvidersCount(1)

      expect(KernelState.definedProvidersCount()).toBe(1)
    })

    test("should not be able to lock without setting definedProvidersCount", () => {
      KernelState.create()

      expect(() => KernelState.setLocked()).toThrow('Expected definedProvidersCount to be a number')
    })

    test("should be able to set locked", () => {
      KernelState.create()
      KernelState.setDefinedProvidersCount(1)
      KernelState.setLocked()

      expect(KernelState.locked()).toBe(true)
    })
  })

  describe("locked", () => {
    test("should not be able to perform actions when state is locked", () => {
      KernelState.create()
      KernelState.setDefinedProvidersCount(1)
      KernelState.setLocked()

      expect(() => KernelState.setDefinedProvidersCount(1)).toThrow(KernelLockedException)
      expect(() => KernelState.addPreparedProvider('provider')).toThrow(KernelLockedException)
      expect(() => KernelState.addReadyProvider('provider')).toThrow(KernelLockedException)
      expect(() => KernelState.setLocked()).toThrow(KernelLockedException)
    })
  })
});

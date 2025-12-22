import { KernelConfig } from "@/contracts/kernel.js";
import { ProviderInterfaceConstructor } from "@/contracts/provider.js";
import { Kernel } from "@/kernel/Kernel.js";
import { KernelState } from "@/kernel/KernelState.js";
import { AbstractProvider } from "@/provider/AbstractProvider.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

const DEFAULT_CONFIG: KernelConfig = {
  environment: 'dev',
  providers: []
}

describe("Kernel Test Suite", () => {

  let providersBootLog: string[];
  let FirstMockProvider: ProviderInterfaceConstructor;
  let SecondMockProvider: ProviderInterfaceConstructor;

  beforeEach(() => {
    Kernel.reset()
    providersBootLog = []

    FirstMockProvider = class extends AbstractProvider {
      async boot(): Promise<void> {
        providersBootLog.push(FirstMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    }
    
    SecondMockProvider = class extends AbstractProvider {
      async boot(): Promise<void> {
        providersBootLog.push(SecondMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    }
  });

  describe("Instance", () => {
    test("should be able to create an instance of the kernel", () => {
      const kernel = Kernel.create(DEFAULT_CONFIG);

      expect(kernel).toBeInstanceOf(Kernel)
    })

    test("should not be able to get the instance without creationg", () => {
      expect(() => Kernel.getInstance()).toThrow('Kernel has not been created')
    })

    test("should not be able to create multiple instances of the kernel", () => {
      const kernel = Kernel.create(DEFAULT_CONFIG)
      const kernel2 = Kernel.create(DEFAULT_CONFIG)

      expect(kernel).toBe(kernel2)
    })
  });

  describe("config", () => {
    test("should be able to get config", () => {
      Kernel.create(DEFAULT_CONFIG)

      expect(Kernel.config().environment).toBe('dev')
    })
  })

  describe("boot", () => {
    test("can boot the kernel", async () => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          new FirstMockProvider()
        ]
      }

      const kernel = Kernel.create(config)
      await kernel.boot({})
      
      const expectedDefinedProvidersCount = 1;
      const expectedPreparedProviders = 1;
      const expectedReadyProviders = 1;

      expect(Kernel.locked()).toBe(true)
      expect(KernelState.locked()).toBe(true)
      expect(KernelState.definedProvidersCount()).toBe(expectedDefinedProvidersCount)
      expect(KernelState.readyProviders().length).toBe(expectedPreparedProviders)
      expect(KernelState.preparedProviders().length).toBe(expectedReadyProviders)
    })

    test("should not be able to boot after already booted", async() => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          new FirstMockProvider()
        ]
      }

      const kernel = Kernel.create(config)
      await kernel.boot({})
      
      expect(async () => kernel.boot({})).rejects.toThrow('Kernel is locked and cannot be modified')
    })

    test("can boot the kernel and with shouldUseProvider defined", async () => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          new FirstMockProvider(),
          new SecondMockProvider()
        ]
      }
  
      const kernel = Kernel.create(config)

      // Ignore SecondMockProvider
      await kernel.boot({
        shouldUseProvider: (provider) => {
          return false === provider instanceof SecondMockProvider
        }
      })

      const expectedDefinedProvidersCount = 2;
      const expectedPreparedProviders = 1;
      const expectedReadyProviders = 1;
      
      expect(Kernel.locked()).toBe(true)
      expect(KernelState.locked()).toBe(true)
      expect(KernelState.definedProvidersCount()).toBe(expectedDefinedProvidersCount)
      expect(KernelState.readyProviders().length).toBe(expectedPreparedProviders)
      expect(KernelState.preparedProviders().length).toBe(expectedReadyProviders)
    })
  })

});

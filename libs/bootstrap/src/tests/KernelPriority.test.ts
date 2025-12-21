import { KernelConfig } from "@/contracts/kernel.js";
import { ProviderInterface } from "@/contracts/provider.js";
import { Kernel } from "@/kernel/Kernel.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Kernel Test Suite", () => {

  let providersBootLog: string[];
  let FirstMockProvider: ProviderInterface;
  let SecondMockProvider: ProviderInterface;
  let ThirdMockProvider: ProviderInterface;
  let FourthMockProvider: ProviderInterface;

  beforeEach(() => {
    Kernel.reset()
    providersBootLog = []

    FirstMockProvider = class {
      async boot(): Promise<void> {
        providersBootLog.push(FirstMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    } as ProviderInterface
    
    SecondMockProvider = class {
      async boot(): Promise<void> {
        providersBootLog.push(SecondMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    } as ProviderInterface

    ThirdMockProvider = class {
      async boot(): Promise<void> {
        providersBootLog.push(ThirdMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    } as ProviderInterface

    FourthMockProvider = class {
      async boot(): Promise<void> {
        providersBootLog.push(FourthMockProvider.constructor.name)
      }
      async register(): Promise<void> {}
    } as ProviderInterface
  });

  describe("boot priority", () => {
    test("should boot providers with priority defined", async () => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          {
            provider: new SecondMockProvider(),
            priority: 2,
          },
          {
            provider: new FirstMockProvider(),
            priority: 1,
          }
        ]
      }
  
      const kernel = Kernel.create(config)
      await kernel.boot({})

      expect(providersBootLog.length).toBe(2)
      expect(providersBootLog[0]).toBe(FirstMockProvider.constructor.name)
      expect(providersBootLog[1]).toBe(SecondMockProvider.constructor.name)
    })

    test("should boot providers with mix priority defined", async () => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          {
            provider: new FourthMockProvider(),
            priority: 4
          },
          new SecondMockProvider(),
          new ThirdMockProvider(),
          {
            provider: new FirstMockProvider(),
            priority: 1,
          }
        ]
      }
  
      const kernel = Kernel.create(config)
      await kernel.boot({})

      expect(providersBootLog.length).toBe(4)
      expect(providersBootLog[0]).toBe(FirstMockProvider.constructor.name)
      expect(providersBootLog[1]).toBe(SecondMockProvider.constructor.name)
      expect(providersBootLog[2]).toBe(ThirdMockProvider.constructor.name)
      expect(providersBootLog[3]).toBe(FourthMockProvider.constructor.name)
    })

    test("should boot providers with mix priority defined", async () => {
      const config: KernelConfig = {
        environment: 'dev',
        providers: [
          {
            provider: new FourthMockProvider(),
            priority: 4
          },
          new SecondMockProvider(),
          new ThirdMockProvider(),
          {
            provider: new FirstMockProvider(),
            priority: 1,
          }
        ]
      }
  
      const kernel = Kernel.create(config)
      await kernel.boot({})

      expect(providersBootLog.length).toBe(4)
      expect(providersBootLog[0]).toBe(FirstMockProvider.constructor.name)
      expect(providersBootLog[1]).toBe(SecondMockProvider.constructor.name)
      expect(providersBootLog[2]).toBe(ThirdMockProvider.constructor.name)
      expect(providersBootLog[3]).toBe(FourthMockProvider.constructor.name)
    })
  })
});

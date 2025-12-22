import { AppContainer } from "@/app/AppContainer.js";
import { AbstractProvider } from "@/provider/AbstractProvider.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Provider Test Suite", () => {

  beforeEach(() => {
    AppContainer.reset()
  });

  describe('bind test', () => {
    test.only('should be able to use the bind method to register then resolve using AppContainer', async () => {

      const foo = { foo: 'bar '}

      class MockProvider extends AbstractProvider {
        async register(): Promise<void> {
            this.bind('test', foo)
        }
      }

      const mockProvider = new MockProvider()
      await mockProvider.register()

      expect(AppContainer.container().resolve('test')).toBe(foo)
    })
  })

});

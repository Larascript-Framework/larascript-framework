import { AppContainer } from "@/container/AppContainer.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import { inject, injectable } from "tsyringe";

class Foo {
  work() {
    return 'work completed'
  }
}

@injectable()
class TestClass
{
  constructor(@inject('foo') public foo: Foo) 
  {}
}

describe("AppContainer Test Suite", () => {

  beforeEach(() => {
    AppContainer.reset()
  });

  describe('dependency injection', () => {
    test.only('should be able dependency inject', () => {

      AppContainer.container().register('foo', { useValue: new Foo() })

      const foo = AppContainer.container().resolve('foo')
      expect(foo).toBeInstanceOf(Foo)

      const testClass = AppContainer.container().resolve(TestClass)
      expect(testClass.foo).toBeInstanceOf(Foo)
      expect(testClass.foo?.work()).toBe('work completed')
    })
  })

});

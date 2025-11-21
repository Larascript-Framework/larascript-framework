import { AppSingleton } from "@/app/index.js";
import { Environment } from "@/consts/index.js";
import { UninitializedContainerError } from "@/exceptions/index.js";
import { Kernel } from "@/kernel/index.js";
import { describe, expect, test } from "@jest/globals";
import { testApp } from "./app/app.js";
import { TestContainers, TestProvider } from "./providers/providers.js";

describe("Kernel Test Suite", () => {
  describe("Kernel with providers", () => {
    beforeAll(async () => {
      Kernel.reset();

      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [new TestProvider()],
        },
        {},
      );
    });

    test("should boot kernel with providers", () => {
      const providerName = TestProvider.name;
      const ready = Kernel.isProviderReady(providerName);

      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(ready).toBeTruthy();
    });

    test("should set correct environment", () => {
      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(AppSingleton.env()).toBe(Environment.testing);
    });

    test("should provide string value", () => {
      const result = AppSingleton.container<TestContainers, "example">(
        "example",
      );

      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(typeof result === "string").toBeTruthy();
      expect(result).toBe("hello world");
    });

    test("should provide object value", () => {
      const result = testApp("object");

      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(typeof result === "object").toBeTruthy();
      expect(result?.value).toBe(1);
    });

    test("should throw error for unbound key", () => {
      expect(Kernel.getInstance().booted()).toBeTruthy();
      
      expect(() => {
        testApp("unbinded_key" as keyof TestContainers);
      }).toThrow(UninitializedContainerError);
    });
  });

  describe("Kernel without providers", () => {
    beforeAll(async () => {
      Kernel.reset();

      await Kernel.boot(
        {
          environment: Environment.testing,
          providers: [new TestProvider()],
        },
        {
          withoutProvider: [TestProvider.name],
        },
      );
    });

    test("should boot kernel without excluded providers", () => {
      console.log("should boot kernel without excluded providers");
      const providerName = TestProvider.name;
      const ready = Kernel.isProviderReady(providerName);

      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(ready).toBeFalsy();
    });

    test("should still set correct environment", () => {
      console.log("should still set correct environment");

      expect(Kernel.getInstance().booted()).toBeTruthy();
      expect(AppSingleton.env()).toBe(Environment.testing);
    });

    test("should throw error for excluded provider's bound keys", () => {
      expect(Kernel.getInstance().booted()).toBeTruthy();

      expect(() => {
        testApp("example");
      }).toThrow(UninitializedContainerError);
    });

    test("should throw error for excluded provider's object keys", () => {
      expect(Kernel.getInstance().booted()).toBeTruthy();

      expect(() => {
        testApp("object");
      }).toThrow(UninitializedContainerError);
    });
  });
});

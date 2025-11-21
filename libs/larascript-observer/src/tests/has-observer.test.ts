/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHasObserver } from "../observer/IHasObserver.js";
import { IObserver } from "../observer/IObserver.js";
import { Observer } from "../observer/Observer.js";

// Test implementation of IHasObserver
class TestHasObserver implements IHasObserver {
  private observerConstructor?: new (...args: any[]) => IObserver;
  private observer?: IObserver;
  private observeProperties: Map<string, string> = new Map();

  setObserverConstructor(
    observerConstructor: (new (...args: any[]) => IObserver) | undefined,
  ): void {
    this.observerConstructor = observerConstructor;
  }

  getObserver(): IObserver | undefined {
    return this.observer;
  }

  setObserveProperty(attribute: string, method: string): void {
    this.observeProperties.set(attribute, method);
  }

  // Helper methods for testing
  createObserver(): void {
    if (this.observerConstructor) {
      this.observer = new this.observerConstructor();
    } else {
      this.observer = undefined;
    }
  }

  getObserveProperties(): Map<string, string> {
    return this.observeProperties;
  }
}

// Test observer class
class TestObserver extends Observer<{ id: number; name: string }> {
  async creating(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.toUpperCase() };
  }
}

// Another test observer class
class AnotherTestObserver extends Observer<{ id: number; name: string }> {
  async updating(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.toLowerCase() };
  }
}

describe("IHasObserver", () => {
  let hasObserver: TestHasObserver;

  beforeEach(() => {
    hasObserver = new TestHasObserver();
  });

  describe("setObserverConstructor", () => {
    it("should set the observer constructor", () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeInstanceOf(TestObserver);
    });

    it("should allow setting undefined constructor", () => {
      hasObserver.setObserverConstructor(undefined);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeUndefined();
    });

    it("should allow changing the observer constructor", () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();
      expect(hasObserver.getObserver()).toBeInstanceOf(TestObserver);

      hasObserver.setObserverConstructor(AnotherTestObserver);
      hasObserver.createObserver();
      expect(hasObserver.getObserver()).toBeInstanceOf(AnotherTestObserver);
    });
  });

  describe("getObserver", () => {
    it("should return undefined when no observer is set", () => {
      const observer = hasObserver.getObserver();
      expect(observer).toBeUndefined();
    });

    it("should return the created observer instance", () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeInstanceOf(TestObserver);
    });

    it("should return the same observer instance on multiple calls", () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();

      const observer1 = hasObserver.getObserver();
      const observer2 = hasObserver.getObserver();

      expect(observer1).toBe(observer2);
    });
  });

  describe("setObserveProperty", () => {
    it("should set observe property mapping", () => {
      hasObserver.setObserveProperty("name", "creating");
      hasObserver.setObserveProperty("email", "updating");

      const properties = hasObserver.getObserveProperties();
      expect(properties.get("name")).toBe("creating");
      expect(properties.get("email")).toBe("updating");
    });

    it("should allow overwriting existing property mappings", () => {
      hasObserver.setObserveProperty("name", "creating");
      hasObserver.setObserveProperty("name", "updating");

      const properties = hasObserver.getObserveProperties();
      expect(properties.get("name")).toBe("updating");
    });

    it("should handle multiple property mappings", () => {
      const mappings = [
        ["id", "creating"],
        ["name", "updating"],
        ["email", "saving"],
        ["status", "deleting"],
      ];

      mappings.forEach(([attribute, method]) => {
        hasObserver.setObserveProperty(attribute, method);
      });

      const properties = hasObserver.getObserveProperties();
      expect(properties.size).toBe(4);

      mappings.forEach(([attribute, method]) => {
        expect(properties.get(attribute)).toBe(method);
      });
    });

    it("should handle empty string values", () => {
      hasObserver.setObserveProperty("", "creating");
      hasObserver.setObserveProperty("name", "");

      const properties = hasObserver.getObserveProperties();
      expect(properties.get("")).toBe("creating");
      expect(properties.get("name")).toBe("");
    });
  });

  describe("Integration Tests", () => {
    it("should work with observer pattern integration", async () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();
      hasObserver.setObserveProperty("name", "creating");

      const observer = hasObserver.getObserver();
      expect(observer).toBeInstanceOf(TestObserver);

      if (observer) {
        const result = await observer.on("creating", { id: 1, name: "test" });
        expect(result.name).toBe("TEST");
      }
    });

    it("should handle observer lifecycle", () => {
      // Set up observer
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();
      expect(hasObserver.getObserver()).toBeInstanceOf(TestObserver);

      // Clear observer
      hasObserver.setObserverConstructor(undefined);
      hasObserver.createObserver();
      expect(hasObserver.getObserver()).toBeUndefined();

      // Set up different observer
      hasObserver.setObserverConstructor(AnotherTestObserver);
      hasObserver.createObserver();
      expect(hasObserver.getObserver()).toBeInstanceOf(AnotherTestObserver);
    });

    it("should maintain property mappings across observer changes", () => {
      // Set up initial mappings
      hasObserver.setObserveProperty("name", "creating");
      hasObserver.setObserveProperty("email", "updating");

      // Change observer
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();

      // Change observer again
      hasObserver.setObserverConstructor(AnotherTestObserver);
      hasObserver.createObserver();

      // Verify mappings are preserved
      const properties = hasObserver.getObserveProperties();
      expect(properties.get("name")).toBe("creating");
      expect(properties.get("email")).toBe("updating");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null observer constructor", () => {
      hasObserver.setObserverConstructor(null as any);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeUndefined();
    });

    it("should handle invalid observer constructor", () => {
      // This would normally throw, but we're testing the interface contract
      expect(() => {
        hasObserver.setObserverConstructor("invalid" as any);
      }).not.toThrow();
    });

    it("should handle very long property names", () => {
      const longAttribute = "a".repeat(1000);
      const longMethod = "b".repeat(1000);

      hasObserver.setObserveProperty(longAttribute, longMethod);

      const properties = hasObserver.getObserveProperties();
      expect(properties.get(longAttribute)).toBe(longMethod);
    });

    it("should handle special characters in property names", () => {
      const specialChars = [
        "!@#$%^&*()",
        "test-name",
        "test_name",
        "test.name",
      ];

      specialChars.forEach((char) => {
        hasObserver.setObserveProperty(char, "creating");
      });

      const properties = hasObserver.getObserveProperties();
      specialChars.forEach((char) => {
        expect(properties.get(char)).toBe("creating");
      });
    });
  });
});

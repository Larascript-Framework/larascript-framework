/* eslint-disable @typescript-eslint/no-explicit-any */
import { IObserverEvent } from "../observer/IObserver.js";
import { Observer } from "../observer/Observer.js";

// Test class that extends Observer for testing purposes
class TestObserver extends Observer<{
  id: number;
  name: string;
  email: string;
}> {
  public creatingCalled = false;
  public createdCalled = false;
  public updatingCalled = false;
  public updatedCalled = false;
  public savingCalled = false;
  public savedCalled = false;
  public deletingCalled = false;
  public deletedCalled = false;
  public customMethodCalled = false;

  async creating(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.creatingCalled = true;
    if (!data || !data.name) {
      return data;
    }
    return { ...data, name: data.name.toUpperCase() };
  }

  async created(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.createdCalled = true;
    return { ...data, email: data.email.toLowerCase() };
  }

  async updating(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.updatingCalled = true;
    return { ...data, name: data.name.trim() };
  }

  async updated(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.updatedCalled = true;
    return { ...data, id: data.id + 1 };
  }

  async saving(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.savingCalled = true;
    return { ...data, name: data.name.replace(/\s+/g, " ") };
  }

  async saved(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.savedCalled = true;
    return { ...data, email: data.email.replace(/\s+/g, "") };
  }

  async deleting(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.deletingCalled = true;
    return { ...data, id: 0 };
  }

  async deleted(data: {
    id: number;
    name: string;
    email: string;
  }): Promise<{ id: number; name: string; email: string }> {
    this.deletedCalled = true;
    return { ...data, name: "DELETED" };
  }

  async customMethod(
    data: { id: number; name: string; email: string },
    prefix: string = "CUSTOM",
  ): Promise<{ id: number; name: string; email: string }> {
    this.customMethodCalled = true;
    return { ...data, name: `${prefix}_${data.name}` };
  }
}

// Test class with minimal implementation for testing default behavior
class MinimalTestObserver extends Observer<{ id: number; name: string }> {
  // No overrides - uses default implementations
}

describe("Observer", () => {
  let testObserver: TestObserver;
  let minimalObserver: MinimalTestObserver;
  let testData: { id: number; name: string; email: string };

  beforeEach(() => {
    testObserver = new TestObserver();
    minimalObserver = new MinimalTestObserver();
    testData = {
      id: 1,
      name: "John Doe",
      email: "JOHN@EXAMPLE.COM",
    };
  });

  describe("Predefined Events", () => {
    const events: IObserverEvent[] = [
      "creating",
      "created",
      "updating",
      "updated",
      "saving",
      "saved",
      "deleting",
      "deleted",
    ];

    events.forEach((event) => {
      describe(`${event} event`, () => {
        it(`should call the ${event} method when triggered`, async () => {
          const result = await testObserver.on(event, testData);

          expect(testObserver[`${event}Called` as keyof TestObserver]).toBe(
            true,
          );
          expect(result).toBeDefined();
        });

        it(`should return modified data from ${event} method`, async () => {
          const result = await testObserver.on(event, testData);

          // Each method modifies the data in a specific way
          switch (event) {
            case "creating":
              expect(result.name).toBe("JOHN DOE");
              break;
            case "created":
              expect(result.email).toBe("john@example.com");
              break;
            case "updating":
              expect(result.name).toBe("John Doe"); // trim doesn't change this
              break;
            case "updated":
              expect(result.id).toBe(2);
              break;
            case "saving":
              expect(result.name).toBe("John Doe"); // no spaces to replace
              break;
            case "saved":
              expect(result.email).toBe("JOHN@EXAMPLE.COM"); // no spaces to replace
              break;
            case "deleting":
              expect(result.id).toBe(0);
              break;
            case "deleted":
              expect(result.name).toBe("DELETED");
              break;
          }
        });

        it(`should return original data when ${event} method is not overridden`, async () => {
          const result = await minimalObserver.on(event, {
            id: 1,
            name: "Test",
          });

          expect(result).toEqual({ id: 1, name: "Test" });
        });
      });
    });
  });

  describe("Custom Events", () => {
    it("should call custom method when it exists", async () => {
      const result = await testObserver.onCustom(
        "customMethod",
        testData,
        "TEST",
      );

      expect(testObserver.customMethodCalled).toBe(true);
      expect(result.name).toBe("TEST_John Doe");
    });

    it("should call custom method with default parameter when no additional args provided", async () => {
      const result = await testObserver.onCustom("customMethod", testData);

      expect(testObserver.customMethodCalled).toBe(true);
      expect(result.name).toBe("CUSTOM_John Doe");
    });

    it("should return original data when custom method does not exist", async () => {
      const result = await testObserver.onCustom("nonExistentMethod", testData);

      expect(result).toEqual(testData);
    });

    it("should return original data when custom method is not a function", async () => {
      // Add a non-function property to test observer
      (testObserver as any).nonFunctionProperty = "not a function";

      const result = await testObserver.onCustom(
        "nonFunctionProperty",
        testData,
      );

      expect(result).toEqual(testData);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined data gracefully", async () => {
      const result = await testObserver.on("creating", null as any);
      expect(result).toBeNull();
    });

    it("should handle empty object data", async () => {
      const emptyData = {};
      const result = await testObserver.on("creating", emptyData as any);
      expect(result).toEqual(emptyData);
    });

    it("should return original data when method is not a function", async () => {
      // Create an observer with a non-function property that matches an event name
      const observerWithNonFunction = new (class extends Observer<{
        id: number;
      }> {
        creating = "not a function" as any;
      })();

      const testData = { id: 1 };
      const result = await observerWithNonFunction.on("creating", testData);
      expect(result).toEqual(testData);
    });

    it("should handle complex nested objects", async () => {
      const complexData = {
        id: 1,
        name: "Test",
        email: "test@example.com",
        metadata: {
          created: new Date(),
          tags: ["tag1", "tag2"],
        },
      };

      const result = await testObserver.on("creating", complexData as any);
      expect(result.name).toBe("TEST");
    });

    it("should preserve object references when no modifications are made", async () => {
      const result = await minimalObserver.on("creating", testData);
      expect(result).toBe(testData); // Same reference for minimal observer
    });
  });

  describe("Method Chaining", () => {
    it("should allow chaining multiple event calls", async () => {
      let result = await testObserver.on("creating", testData);
      result = await testObserver.on("updating", result);
      result = await testObserver.on("saving", result);

      expect(testObserver.creatingCalled).toBe(true);
      expect(testObserver.updatingCalled).toBe(true);
      expect(testObserver.savingCalled).toBe(true);
      expect(result.name).toBe("JOHN DOE"); // Last modification from saving
    });
  });

  describe("Async Behavior", () => {
    it("should properly handle async operations", async () => {
      const asyncObserver = new (class extends Observer<{ id: number }> {
        async creating(data: { id: number }): Promise<{ id: number }> {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { ...data, id: data.id * 2 };
        }
      })();

      const result = await asyncObserver.on("creating", { id: 5 });
      expect(result.id).toBe(10);
    });

    it("should handle multiple concurrent calls", async () => {
      const promises = [
        testObserver.on("creating", { ...testData, id: 1 }),
        testObserver.on("creating", { ...testData, id: 2 }),
        testObserver.on("creating", { ...testData, id: 3 }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe("JOHN DOE");
      expect(results[1].name).toBe("JOHN DOE");
      expect(results[2].name).toBe("JOHN DOE");
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety with generic types", async () => {
      const typedObserver = new (class extends Observer<{
        id: number;
        name: string;
      }> {
        async creating(data: {
          id: number;
          name: string;
        }): Promise<{ id: number; name: string }> {
          return { ...data, name: data.name.toUpperCase() };
        }
      })();

      const result = await typedObserver.on("creating", {
        id: 1,
        name: "test",
      });
      expect(result.name).toBe("TEST");
      expect(result.id).toBe(1);
    });
  });
});

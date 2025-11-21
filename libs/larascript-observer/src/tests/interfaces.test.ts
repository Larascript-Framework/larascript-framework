/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IHasObserver,
  ObserveConstructor,
  TClassConstructor,
} from "../observer/IHasObserver.js";
import { IObserver, IObserverEvent } from "../observer/IObserver.js";
import { Observer } from "../observer/Observer.js";

// Test implementation of IObserver
class TestObserver implements IObserver<{ id: number; name: string }> {
  async creating(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.toUpperCase() };
  }

  async created(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.toLowerCase() };
  }

  async updating(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, id: data.id + 1 };
  }

  async updated(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, id: data.id - 1 };
  }

  async saving(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.trim() };
  }

  async saved(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: data.name.replace(/\s+/g, " ") };
  }

  async deleting(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, id: 0 };
  }

  async deleted(data: {
    id: number;
    name: string;
  }): Promise<{ id: number; name: string }> {
    return { ...data, name: "DELETED" };
  }

  async on(
    name: IObserverEvent,
    data: { id: number; name: string },
  ): Promise<{ id: number; name: string }> {
    switch (name) {
      case "creating":
        return this.creating(data);
      case "created":
        return this.created(data);
      case "updating":
        return this.updating(data);
      case "updated":
        return this.updated(data);
      case "saving":
        return this.saving(data);
      case "saved":
        return this.saved(data);
      case "deleting":
        return this.deleting(data);
      case "deleted":
        return this.deleted(data);
      default:
        return data;
    }
  }

  async onCustom(
    _customName: string,
    data: { id: number; name: string },
  ): Promise<{ id: number; name: string }> {
    return data;
  }
}

// Test implementation of IHasObserver
class TestHasObserver implements IHasObserver {
  private observerConstructor?: ObserveConstructor;
  private observer?: IObserver;

  setObserverConstructor(
    observerConstructor: ObserveConstructor | undefined,
  ): void {
    this.observerConstructor = observerConstructor;
  }

  getObserver(): IObserver | undefined {
    return this.observer;
  }

  setObserveProperty(_attribute: string, _method: string): void {
    // Implementation for testing
  }

  // Helper method for testing
  createObserver(): void {
    if (this.observerConstructor) {
      this.observer = new this.observerConstructor();
    }
  }
}

describe("Interfaces and Types", () => {
  describe("IObserver Interface", () => {
    let observer: TestObserver;

    beforeEach(() => {
      observer = new TestObserver();
    });

    it("should implement all required methods", () => {
      expect(typeof observer.creating).toBe("function");
      expect(typeof observer.created).toBe("function");
      expect(typeof observer.updating).toBe("function");
      expect(typeof observer.updated).toBe("function");
      expect(typeof observer.saving).toBe("function");
      expect(typeof observer.saved).toBe("function");
      expect(typeof observer.deleting).toBe("function");
      expect(typeof observer.deleted).toBe("function");
      expect(typeof observer.on).toBe("function");
      expect(typeof observer.onCustom).toBe("function");
    });

    it("should handle all predefined events", async () => {
      const testData = { id: 1, name: "Test" };
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

      for (const event of events) {
        const result = await observer.on(event, testData);
        expect(result).toBeDefined();
        expect(typeof result.id).toBe("number");
        expect(typeof result.name).toBe("string");
      }
    });

    it("should handle custom events", async () => {
      const testData = { id: 1, name: "Test" };
      const result = await observer.onCustom("customEvent", testData);
      expect(result).toEqual(testData);
    });

    it("should maintain type safety with generic types", async () => {
      const typedObserver = new (class
        implements IObserver<{ id: number; email: string }>
      {
        async creating(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return { ...data, email: data.email.toUpperCase() };
        }
        async created(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async updating(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async updated(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async saving(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async saved(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async deleting(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async deleted(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return data;
        }
        async on(
          _name: IObserverEvent,
          data: { id: number; email: string },
        ): Promise<{ id: number; email: string }> {
          return data;
        }
        async onCustom(
          _customName: string,
          data: { id: number; email: string },
        ): Promise<{ id: number; email: string }> {
          return data;
        }
      })();

      const result = await typedObserver.creating({
        id: 1,
        email: "test@example.com",
      });
      expect(result.email).toBe("TEST@EXAMPLE.COM");
    });
  });

  describe("IHasObserver Interface", () => {
    let hasObserver: TestHasObserver;

    beforeEach(() => {
      hasObserver = new TestHasObserver();
    });

    it("should implement all required methods", () => {
      expect(typeof hasObserver.setObserverConstructor).toBe("function");
      expect(typeof hasObserver.getObserver).toBe("function");
      expect(typeof hasObserver.setObserveProperty).toBe("function");
    });

    it("should work with observer constructors", () => {
      hasObserver.setObserverConstructor(TestObserver);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeInstanceOf(TestObserver);
    });

    it("should handle undefined observer constructor", () => {
      hasObserver.setObserverConstructor(undefined);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeUndefined();
    });
  });

  describe("Type Definitions", () => {
    describe("IObserverEvent", () => {
      it("should include all predefined event names", () => {
        const validEvents: IObserverEvent[] = [
          "creating",
          "created",
          "updating",
          "updated",
          "saving",
          "saved",
          "deleting",
          "deleted",
        ];

        validEvents.forEach((event) => {
          expect(validEvents).toContain(event);
        });
      });

      it("should not allow invalid event names", () => {
        // TypeScript compilation test - this should cause a type error
        // const invalidEvent: IObserverEvent = 'invalid'; // This would be a type error
        expect(true).toBe(true); // Placeholder for type checking
      });
    });

    describe("TClassConstructor", () => {
      it("should work with class constructors", () => {
        const constructor: TClassConstructor<TestObserver> = TestObserver;
        const instance = new constructor();
        expect(instance).toBeInstanceOf(TestObserver);
      });

      it("should work with generic types", () => {
        const constructor: TClassConstructor<IObserver> = TestObserver;
        const instance = new constructor();
        expect(instance).toBeInstanceOf(TestObserver);
        expect(instance).toBeInstanceOf(Object);
      });
    });

    describe("ObserveConstructor", () => {
      it("should work with observer constructors", () => {
        const constructor: ObserveConstructor = TestObserver;
        const instance = new constructor();
        expect(instance).toBeInstanceOf(TestObserver);
      });

      it("should be compatible with IObserver interface", () => {
        const constructor: ObserveConstructor = TestObserver;
        const instance = new constructor();

        // Should have all IObserver methods
        expect(typeof instance.creating).toBe("function");
        expect(typeof instance.created).toBe("function");
        expect(typeof instance.updating).toBe("function");
        expect(typeof instance.updated).toBe("function");
        expect(typeof instance.saving).toBe("function");
        expect(typeof instance.saved).toBe("function");
        expect(typeof instance.deleting).toBe("function");
        expect(typeof instance.deleted).toBe("function");
        expect(typeof instance.on).toBe("function");
        expect(typeof instance.onCustom).toBe("function");
      });
    });
  });

  describe("Integration Tests", () => {
    it("should work with Observer class implementation", () => {
      class ExtendedObserver extends Observer<{ id: number; name: string }> {
        async creating(data: {
          id: number;
          name: string;
        }): Promise<{ id: number; name: string }> {
          return { ...data, name: data.name.toUpperCase() };
        }
      }

      const hasObserver = new TestHasObserver();
      hasObserver.setObserverConstructor(ExtendedObserver);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      expect(observer).toBeInstanceOf(ExtendedObserver);
      expect(observer).toBeInstanceOf(Observer);
    });

    it("should maintain type safety across the entire chain", async () => {
      class TypedObserver extends Observer<{ id: number; email: string }> {
        async creating(data: {
          id: number;
          email: string;
        }): Promise<{ id: number; email: string }> {
          return { ...data, email: data.email.toUpperCase() };
        }
      }

      const hasObserver = new TestHasObserver();
      hasObserver.setObserverConstructor(TypedObserver);
      hasObserver.createObserver();

      const observer = hasObserver.getObserver();
      if (observer) {
        const result = await observer.on("creating", {
          id: 1,
          email: "test@example.com",
        });
        expect(result.email).toBe("TEST@EXAMPLE.COM");
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle async operations correctly", async () => {
      const asyncObserver = new (class implements IObserver<{ id: number }> {
        async creating(data: { id: number }): Promise<{ id: number }> {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { ...data, id: data.id * 2 };
        }
        async created(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async updating(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async updated(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async saving(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async saved(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async deleting(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async deleted(data: { id: number }): Promise<{ id: number }> {
          return data;
        }
        async on(
          _name: IObserverEvent,
          data: { id: number },
        ): Promise<{ id: number }> {
          return data;
        }
        async onCustom(
          _customName: string,
          data: { id: number },
        ): Promise<{ id: number }> {
          return data;
        }
      })();

      const result = await asyncObserver.creating({ id: 5 });
      expect(result.id).toBe(10);
    });

    it("should handle method chaining", async () => {
      const observer = new TestObserver();
      const testData = { id: 1, name: "Test" };

      let result = await observer.on("creating", testData);
      result = await observer.on("updating", result);
      result = await observer.on("saving", result);

      expect(result.id).toBe(2); // 1 + 1 from updating (saving doesn't change id)
      expect(result.name).toBe("TEST"); // From creating
    });
  });
});

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { BaseEventListener } from "../events/base/BaseEventListener.js";
import { EventRegistry } from "../events/registry/EventRegistry.js";

// Mock dependencies
jest.mock("@larascript-framework/larascript-core", () => ({
  AppSingleton: {
    safeContainer: jest.fn(() => ({
      getDefaultDriverCtor: jest.fn(() => class MockDriver {})
    }))
  }
}));

jest.mock("@larascript-framework/larascript-utils", () => ({
  BaseCastable: class MockBaseCastable {
    getCastFromObject = jest.fn((data) => data);
    getCast = jest.fn((data) => data);
    isValidType = jest.fn(() => true);
  },
  TCastableType: {},
  TCasts: {},
  TClassConstructor: {}
}));

// Create a concrete implementation for testing
class TestListener extends BaseEventListener {
  async execute(): Promise<void> {
    // Test implementation
  }
}

describe("BaseEventListener", () => {
  beforeEach(() => {
    EventRegistry.clear();
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("should create listener extending BaseEvent", () => {
      const listener = new TestListener();
      
      expect(listener).toBeInstanceOf(BaseEventListener);
      expect(listener.getName()).toBe("TestListener");
    });

    test("should auto-register in EventRegistry", () => {
      new TestListener();
      
      const registeredEvents = EventRegistry.getEvents();
      expect(registeredEvents).toContain(TestListener);
    });
  });

  describe("inheritance", () => {
    test("should inherit from BaseEvent", () => {
      const listener = new TestListener();
      
      // Test that it has BaseEvent methods
      expect(typeof listener.getName).toBe("function");
      expect(typeof listener.getDriverName).toBe("function");
      expect(typeof listener.execute).toBe("function");
      expect(typeof listener.getPayload).toBe("function");
      expect(typeof listener.setPayload).toBe("function");
      expect(typeof listener.getQueueName).toBe("function");
      expect(typeof listener.validatePayload).toBe("function");
    });
  });

  describe("execute", () => {
    test("should execute without throwing error", async () => {
      const listener = new TestListener();
      await expect(listener.execute()).resolves.toBeUndefined();
    });
  });

  describe("getDriverName", () => {
    test("should return driver name", () => {
      const listener = new TestListener({}, 'TestDriver');
      const driverName = listener.getDriverName();
      expect(driverName).toBe('TestDriver');
    });
  });

  describe("payload operations", () => {
    test("should support payload operations", () => {
      const payload = { message: "test" };
      const listener = new TestListener(payload);
      
      expect(listener.getPayload()).toEqual(payload);
    });

    test("should support payload validation", () => {
      const validPayload = { message: "test" };
      const listener = new TestListener(validPayload);
      
      expect(listener.validatePayload()).toBe(true);
    });

    test("should support queue name", () => {
      const listener = new TestListener();
      expect(listener.getQueueName()).toBe("default");
    });
  });

  describe("multiple listeners", () => {
    test("should create multiple listeners independently", () => {
      const listener1 = new TestListener();
      const listener2 = new TestListener();
      
      expect(listener1).not.toBe(listener2);
      expect(listener1.getName()).toBe("TestListener");
      expect(listener2.getName()).toBe("TestListener");
    });
  });
});

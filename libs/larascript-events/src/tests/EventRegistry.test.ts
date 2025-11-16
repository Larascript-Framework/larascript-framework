import { beforeEach, describe, expect, test } from "@jest/globals";
import { EventRegistry } from "../events/registry/EventRegistry.js";

// Create a simple test class
class TestEvent {
  static displayName = "TestEvent";
}

class TestListener {
  static displayName = "TestListener";
}

class TestSubscriber {
  static displayName = "TestSubscriber";
}

describe("EventRegistry", () => {
  beforeEach(() => {
    EventRegistry.clear();
  });

  describe("register", () => {
    test("should register a single event", () => {
      const result = EventRegistry.register(TestEvent as any);
      
      expect(result).toBe(TestEvent);
      expect(EventRegistry.getEvents()).toContain(TestEvent);
    });

    test("should register multiple events without duplicates", () => {
      EventRegistry.register(TestEvent as any);
      EventRegistry.register(TestEvent as any); // Duplicate
      EventRegistry.register(TestListener as any);
      
      const events = EventRegistry.getEvents();
      expect(events).toHaveLength(2);
      expect(events).toContain(TestEvent);
      expect(events).toContain(TestListener);
    });
  });

  describe("registerListener", () => {
    test("should register a listener", () => {
      const result = EventRegistry.registerListener(TestListener as any);
      
      expect(result).toBe(TestListener);
      expect(EventRegistry.getEvents()).toContain(TestListener);
    });
  });

  describe("registerSubscriber", () => {
    test("should register a subscriber", () => {
      const result = EventRegistry.registerSubscriber(TestSubscriber as any);
      
      expect(result).toBe(TestSubscriber);
      expect(EventRegistry.getEvents()).toContain(TestSubscriber);
    });
  });

  describe("registerMany", () => {
    test("should register multiple events at once", () => {
      EventRegistry.registerMany([TestEvent, TestListener, TestSubscriber] as any[]);
      
      const events = EventRegistry.getEvents();
      expect(events).toHaveLength(3);
      expect(events).toContain(TestEvent);
      expect(events).toContain(TestListener);
      expect(events).toContain(TestSubscriber);
    });

    test("should handle empty array", () => {
      EventRegistry.registerMany([]);
      
      expect(EventRegistry.getEvents()).toHaveLength(0);
    });
  });

  describe("getEvents", () => {
    test("should return empty array when no events registered", () => {
      expect(EventRegistry.getEvents()).toEqual([]);
    });

    test("should return all registered events", () => {
      EventRegistry.register(TestEvent as any);
      EventRegistry.register(TestListener as any);
      
      const events = EventRegistry.getEvents();
      expect(events).toHaveLength(2);
      expect(events).toContain(TestEvent);
      expect(events).toContain(TestListener);
    });
  });

  describe("isInitialized", () => {
    test("should return false by default", () => {
      expect(EventRegistry.isInitialized()).toBe(false);
    });

    test("should return true after setInitialized", () => {
      EventRegistry.setInitialized();
      expect(EventRegistry.isInitialized()).toBe(true);
    });
  });

  describe("setInitialized", () => {
    test("should mark registry as initialized", () => {
      EventRegistry.setInitialized();
      expect(EventRegistry.isInitialized()).toBe(true);
    });
  });

  describe("clear", () => {
    test("should clear all registered events and reset initialization", () => {
      EventRegistry.register(TestEvent as any);
      EventRegistry.register(TestListener as any);
      EventRegistry.setInitialized();
      
      EventRegistry.clear();
      
      expect(EventRegistry.getEvents()).toEqual([]);
      expect(EventRegistry.isInitialized()).toBe(false);
    });

    test("should work when registry is already empty", () => {
      EventRegistry.clear();
      
      expect(EventRegistry.getEvents()).toEqual([]);
      expect(EventRegistry.isInitialized()).toBe(false);
    });
  });

  describe("integration", () => {
    test("should maintain state across multiple operations", () => {
      // Register events
      EventRegistry.register(TestEvent as any);
      EventRegistry.register(TestListener as any);
      
      // Check state
      expect(EventRegistry.getEvents()).toHaveLength(2);
      
      // Register more
      EventRegistry.registerListener(TestSubscriber as any);
      expect(EventRegistry.getEvents()).toHaveLength(3);
      
      // Mark as initialized
      EventRegistry.setInitialized();
      expect(EventRegistry.isInitialized()).toBe(true);
      
      // Clear and verify reset
      EventRegistry.clear();
      expect(EventRegistry.getEvents()).toEqual([]);
      expect(EventRegistry.isInitialized()).toBe(false);
    });
  });
});

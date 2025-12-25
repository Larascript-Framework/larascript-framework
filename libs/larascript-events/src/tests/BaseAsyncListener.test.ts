import { BaseAsyncListener } from "@/events/base/BaseAsyncListener.js";
import { EVENT_DRIVERS } from "../events/consts/drivers.js";
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
class TestEvent extends BaseAsyncListener {
  async execute(): Promise<void> {
    // Test implementation
  }
}

describe("BaseEvent", () => {
  beforeEach(() => {
    EventRegistry.clear();
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    test("should create event with valid payload", () => {
      const payload = { message: "test", count: 42 };
      const event = new TestEvent(payload);
      
      expect(event.getPayload()).toEqual(payload);
      expect(event.getName()).toBe("TestEvent");
    });

    test("should create event with null payload", () => {
      const event = new TestEvent(null);
      
      expect(event.getPayload()).toBeNull();
    });

    test("should auto-register event in EventRegistry", () => {
      new TestEvent();
      
      const registeredEvents = EventRegistry.getEvents();
      expect(registeredEvents).toContain(TestEvent);
    });
  });

  describe("validatePayload", () => {
    test("should return true for valid JSON payloads", () => {
      const validPayloads = [
        { message: "test", count: 42 },
        { count: 42, nested: { value: true } },
        [1, 2, 3],
        "string",
        123,
        true,
        null
      ];

      validPayloads.forEach(payload => {
        const event = new TestEvent(payload as any);
        expect(event.validatePayload()).toBe(true);
      });
    });

    describe("queable driver", () => {
      test("should use sync driver", () => {
        const event = new TestEvent();
        expect(event.getDriverName()).toBe(EVENT_DRIVERS.QUEABLE);
      });
    });

    describe("listener", () => {
      test("should be a listener", () => {
        const event = new TestEvent();
        expect(event.type).toBe("listener");
      });
    });
  });
});

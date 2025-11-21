import { BaseEvent } from "../events/base/BaseEvent.js";
import { EVENT_DRIVERS } from "../events/consts/drivers.js";
import { EventInvalidPayloadException } from "../events/exceptions/EventInvalidPayloadException.js";
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
class TestEvent extends BaseEvent<unknown> {
  async execute(): Promise<void> {
    // Test implementation
  }
}

class TestQueableEvent extends BaseEvent<unknown> {

  constructor(payload: unknown | null = null) {
    super(payload);
    this.useQueableDriver();
  }

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

    test("should throw exception for payloads that cannot be stringified by JSON.stringify", () => {
      // BigInt is not serializable in JSON
      const bigIntPayload = { value: BigInt(10) };
      expect(() => new TestEvent(bigIntPayload)).toThrow(EventInvalidPayloadException);

      // Circular reference is not serializable in JSON
      const circular: any = {};
      circular.self = circular;
      expect(() => new TestEvent(circular)).toThrow(EventInvalidPayloadException);
    });

    test("should return false for circular reference payloads", () => {
      // Create event with valid payload first
      const event = new TestEvent({ message: "test" });
      
      // Then test with circular reference
      const circular: any = {};
      circular.self = circular;
      
      // Set the payload directly to test validation
      (event as any).payload = circular;
      expect(event.validatePayload()).toBe(false);
    });
  });

  describe("getPayload", () => {
    test("should return the payload with casting", () => {
      const payload = { message: "test", count: 42 };
      const event = new TestEvent(payload);
      
      const result = event.getPayload();
      expect(result).toEqual(payload);
    });
  });

  describe("setPayload", () => {
    test("should set the payload", () => {
      const event = new TestEvent();
      const newPayload = { message: "new", count: 100 };
      
      event.setPayload(newPayload);
      expect(event.getPayload()).toEqual(newPayload);
    });
  });

  describe("getQueueName", () => {
    test("should return default queue name", () => {
      const event = new TestEvent();
      expect(event.getQueueName()).toBe("default");
    });
  });

  describe("execute", () => {
    test("should execute without throwing error", async () => {
      const event = new TestEvent();
      await expect(event.execute()).resolves.toBeUndefined();
    });
  });

  describe("getName", () => {
    test("should return class name", () => {
      const event = new TestEvent();
      expect(event.getName()).toBe("TestEvent");
    });
  });

  describe("getDriverName", () => {
    test("should return the driver name when passed in constructor", () => {
      const driverName = "CustomDriver";
      const event = new TestEvent(undefined, driverName);
      expect(event.getDriverName()).toBe(driverName);
    });

    test("should return undefined if no driver is passed", () => {
      const event = new TestEvent();
      expect(event.getDriverName()).toBeUndefined();
    });
  });

  describe("queable driver", () => {
    test("should use queable driver", () => {
      const event = new TestQueableEvent()
       
      expect(event.getDriverName()).toBe(EVENT_DRIVERS.QUEABLE);
    });
  });
  
});

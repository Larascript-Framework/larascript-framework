import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { BaseEvent } from "../events/base/BaseEvent.js";
import { BaseEventListener } from "../events/base/BaseEventListener.js";
import { EVENT_DRIVERS } from "../events/consts/drivers.js";
import { IEventConfig } from "../events/interfaces/config.t.js";
import { IEventDriver } from "../events/interfaces/index.js";
import { EventRegistry } from "../events/registry/EventRegistry.js";
import { EventConfig } from "../events/services/EventConfig.js";
import { EventService } from "../events/services/EventService.js";

// Mock dependencies
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

// Create a mock event driver for testing
class MockEventDriver implements IEventDriver {
  name: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;
  
  private eventService: EventService;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  getName(): string {
    return "MockEventDriver";
  }

  setEventService(eventService: EventService): void {
    this.eventService = eventService;
  }

  async dispatch(event: any): Promise<void> {
    // Mock dispatch implementation
    console.log(`Mock driver dispatching event: ${event.getName()}`);
  }
}

// Create test events
class TestEvent extends BaseEvent<{ message: string; count: number }> {
  async execute(): Promise<void> {
    // Test implementation
  }
}

class NotMockedTestEvent extends BaseEvent<{ message: string; count: number }> {
  async execute(): Promise<void> {
    // Test implementation
  }
}

class TestListenerEvent extends BaseEventListener<{ message: string; count: number }> {
  async execute(): Promise<void> {
    // Test implementation
  }
}

class UnregisteredEvent extends BaseEvent<{ message: string; count: number }> {
    async execute(): Promise<void> {
      // Test implementation
    }
  }

describe("EventService", () => {
  let eventService: EventService;
  let config: IEventConfig;

  beforeEach(() => {
    EventRegistry.clear();
    EventRegistry.register(TestEvent);
    EventRegistry.register(TestListenerEvent);
    EventRegistry.register(NotMockedTestEvent);
    jest.clearAllMocks();

    // Create event configuration
    config = {
      defaultDriver: MockEventDriver,
      drivers: {
        "MockEventDriver": EventConfig.createConfigDriver(MockEventDriver),
        "default": EventConfig.createConfigDriver(MockEventDriver)
      },
      listeners: []
    };

    eventService = new EventService(config);
    eventService.mockEvent(TestEvent);
    eventService.mockEvent(TestListenerEvent);
  });

  describe("constructor", () => {
    test("should create EventService with configuration", () => {
      expect(eventService).toBeInstanceOf(EventService);
      expect(eventService.getConfig()).toEqual(config);
    });
  });

  describe("dispatch", () => {
    test("should successfully dispatch a basic event", async () => {
      const payload = { message: "test message", count: 42 };
      const event = new TestEvent(payload, "MockEventDriver");

      // Dispatch the event
      await expect(eventService.dispatch(event)).resolves.toBeUndefined();

      // Verify the event was marked as dispatched
      expect(eventService.mockEventsDispatched).toContain(event);
    });

    test("should successfully dispatch a listener event", async () => {
      const payload = { message: "listener test", count: 100 };
      const event = new TestListenerEvent(payload, "MockEventDriver");

      // Register the event
      EventRegistry.register(TestListenerEvent);

      // Dispatch the event
      await expect(eventService.dispatch(event)).resolves.toBeUndefined();

      // Verify the event was marked as dispatched
      expect(eventService.mockEventsDispatched).toContain(event);
    });

    test("should throw EventDispatchException for unregistered event", async () => {
      const payload = { message: "unregistered", count: 0 };
      const event = new UnregisteredEvent(payload, "MockEventDriver");

      // Don't register the event
      await expect(eventService.dispatch(event)).rejects.toThrow(
        "Event 'UnregisteredEvent' not registered. The event must be exported and registered with EventRegistry.register(event)."
      );
    });

    test("should throw EventDispatchException for unregistered driver", async () => {
      const payload = { message: "test", count: 42 };
      const event = new NotMockedTestEvent(payload, "NonExistentDriver");

      // Register the event
      EventRegistry.register(NotMockedTestEvent);

      // Try to dispatch with non-existent driver
      await expect(eventService.dispatch(event)).rejects.toThrow(
        "Driver 'NonExistentDriver' not registered."
      );
    });
  });

  describe("mock events", () => {
    test("should track dispatched events", async () => {
      const payload = { message: "tracked event", count: 123 };
      const event = new TestEvent(payload, "MockEventDriver");

      // Register the event
      EventRegistry.register(TestEvent);

      // Dispatch the event
      await eventService.dispatch(event);

      // Verify tracking
      expect(eventService.mockEventsDispatched).toHaveLength(1);
      expect(eventService.mockEventsDispatched[0]).toBe(event);
    });

    test("should reset mock events", () => {
      // Add some mock events
      eventService.mockEvents = [TestEvent];
      eventService.mockEventsDispatched = [new TestEvent()];

      // Reset
      eventService.resetMockEvents();

      // Verify reset
      expect(eventService.mockEvents).toHaveLength(0);
      expect(eventService.mockEventsDispatched).toHaveLength(0);
    });
  });

  describe("assertDispatched", () => {
    test("should return true for dispatched event", async () => {
      const payload = { message: "assert test", count: 456 };
      const event = new TestEvent(payload, "MockEventDriver");

      // Register the event
      EventRegistry.register(TestEvent);

      // Dispatch the event
      await eventService.dispatch(event);

      // Assert it was dispatched
      const result = eventService.assertDispatched(TestEvent, (dispatchedPayload) => {
        expect(dispatchedPayload).toEqual(payload);
        return true;
      });

      expect(result).toBe(true);
    });

    test("should throw EventNotDispatchedException for non-dispatched event", () => {
      expect(() => {
        eventService.assertDispatched(TestEvent, () => true);
      }).toThrow("Event 'TestEvent' was not dispatched.");
    });
  });
});

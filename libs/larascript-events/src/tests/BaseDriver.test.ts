import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { BaseDriver } from "../events/base/BaseDriver.js";
import { EVENT_DRIVERS } from "../events/consts/drivers.js";
import { BaseEvent, EventConfig, EventRegistry, EventService } from "../events/index.js";
import { IBaseEvent } from "../events/interfaces/base.t.js";
import { IEventDriver, IEventDriversConfigOption } from "../events/interfaces/driver.t.js";
import { IEventService } from "../events/interfaces/services.t.js";

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

// Create a concrete implementation of BaseDriver for testing
class TestDriver extends BaseDriver {
  name = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;
  
  async dispatch(event: IBaseEvent): Promise<void> {
    // Test implementation
    console.log(`Test driver dispatching event: ${event.getName()}`);
  }
}

class MockEventDriver implements IEventDriver {
    name: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;
    
    private eventService!: IEventService;
  
    getName(): string {
      return "MockEventDriver";
    }
  
    setEventService(eventService: IEventService): void {
      this.eventService = eventService;
    }
  
    async dispatch(event: IBaseEvent): Promise<void> {
      // Mock dispatch implementation
      console.log(`Mock driver dispatching event: ${event.getName()}`);
    }
  }

// Create a mock event for testing
class MockEvent extends BaseEvent<unknown> {
  payload: unknown = { message: "test" };
  
  getName(): string {
    return "MockEvent";
  }
  
  getQueueName(): string {
    return "default";
  }

  async execute(): Promise<void> {
    // Mock implementation
  }
 
}

describe("BaseDriver", () => {
  let driver: TestDriver;
  let eventService: IEventService;
  let mockEvent: MockEvent;

  beforeEach(() => {
    EventRegistry.clear();
    EventRegistry.register(MockEvent);
    driver = new TestDriver();
    eventService = new EventService({
        defaultDriver: MockEventDriver,
        drivers: {
          "MockEventDriver": EventConfig.createConfigDriver(MockEventDriver),
          "default": EventConfig.createConfigDriver(MockEventDriver)
        },
        listeners: []
    });
    mockEvent = new MockEvent();
  });

  describe("constructor and initialization", () => {
    test("should initialize with default name", () => {
      expect(driver.name).toBe(EVENT_DRIVERS.SYNC);
    });

    test("should have eventService as undefined initially", () => {
      expect((driver as any).eventService).toBeUndefined();
    });
  });

  describe("setEventService", () => {
    test("should set the event service instance", () => {
      driver.setEventService(eventService);
      expect((driver as any).eventService).toBe(eventService);
    });

  });

  describe("getName", () => {
    test("should return the driver name as string", () => {
      expect(driver.getName()).toBe(EVENT_DRIVERS.SYNC);
    });

    test("should return the correct name for different driver types", () => {
      const queableDriver = new TestDriver();
      queableDriver.name = EVENT_DRIVERS.QUEABLE as keyof typeof EVENT_DRIVERS;
      
      expect(queableDriver.getName()).toBe(EVENT_DRIVERS.QUEABLE);
    });
  });

  describe("dispatch", () => {
    test("should be an abstract method that must be implemented", () => {
      // This test verifies that dispatch is abstract by ensuring it can be called
      // The actual implementation is in the TestDriver class
      expect(typeof driver.dispatch).toBe("function");
    });

    test("should accept an IBaseEvent parameter", async () => {
      // This test verifies the method signature
      await expect(driver.dispatch(mockEvent)).resolves.toBeUndefined();
    });
  });

  describe("getOptions", () => {
    test("should return undefined when no event service is set", () => {
      const options = driver.getOptions();
      expect(options).toBeUndefined();
    });

    test("should return undefined when no driver options are configured", () => {
      driver.setEventService(eventService);
      const options = (driver as any).getOptions();
      expect(options).toBeUndefined();
    });

    test("should return driver options when configured", () => {
      const testOptions = { timeout: 5000, retries: 3 };
      const driverConfig: IEventDriversConfigOption = {
        driver: TestDriver as any,
        options: testOptions
      };
      
      driver.setEventService(eventService);
      eventService.setDriverOptions(driver, driverConfig);
      
      const options = (driver as any).getOptions();
      expect(options).toEqual(testOptions);
    });

    test("should return undefined when driver options exist but options property is undefined", () => {
      const driverConfig: IEventDriversConfigOption = {
        driver: TestDriver as any,
        options: undefined
      };
      
      driver.setEventService(eventService);
      eventService.setDriverOptions(driver, driverConfig);
      
      const options = (driver as any).getOptions();
      expect(options).toBeUndefined();
    });

    test("should support generic type parameter", () => {
      interface CustomOptions {
        timeout: number;
        retries: number;
        customField: string;
      }
      
      const testOptions: CustomOptions =  { 
        timeout: 5000, 
        retries: 3, 
        customField: "test" 
      };
      type CustomOptionsType = typeof testOptions & Record<string, unknown>;
      const driverConfig: IEventDriversConfigOption = {
        driver: TestDriver,
        options: testOptions as unknown as CustomOptionsType
      };
      
      driver.setEventService(eventService);
      eventService.setDriverOptions(driver, driverConfig);
      
      const options = driver.getOptions<CustomOptionsType>();
      expect(options).toEqual(testOptions);
      expect(options?.customField).toBe("test");
    });
  });

  describe("inheritance and interface compliance", () => {
    test("should implement IEventDriver interface", () => {
      expect(driver.name).toBeDefined();
      expect(typeof driver.getName).toBe("function");
      expect(typeof driver.setEventService).toBe("function");
      expect(typeof driver.dispatch).toBe("function");
    });

    test("should extend BaseDriver properly", () => {
      expect(driver instanceof BaseDriver).toBe(true);
    });

  });

  describe("edge cases and error handling", () => {
    test("should handle null event service gracefully in getOptions", () => {
      // This shouldn't throw an error
      const options = driver.getOptions();

      expect(options).toBeUndefined();
    });

    test("should handle event service that returns undefined for getDriverOptions", () => {
      const mockEventService = {
        getDriverOptions: jest.fn().mockReturnValue(undefined)
      } as any;
      
      driver.setEventService(mockEventService);
      const options = (driver as any).getOptions();
      
      expect(options).toBeUndefined();
      expect(mockEventService.getDriverOptions).toHaveBeenCalledWith(driver);
    });

    test("should handle event service that returns null for getDriverOptions", () => {
      const mockEventService = {
        getDriverOptions: jest.fn().mockReturnValue(null)
      } as any;
      
      driver.setEventService(mockEventService);
      const options = (driver as any).getOptions();
      
      expect(options).toBeUndefined();
    });
  });
});

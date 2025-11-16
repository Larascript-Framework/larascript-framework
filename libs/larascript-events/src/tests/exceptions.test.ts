import { describe, expect, test } from "@jest/globals";
import { EventDispatchException } from "../events/exceptions/EventDispatchException.js";
import { EventDriverException } from "../events/exceptions/EventDriverException.js";
import { EventInvalidPayloadException } from "../events/exceptions/EventInvalidPayloadException.js";
import { EventMockException } from "../events/exceptions/EventMockException.js";
import { EventNotDispatchedException } from "../events/exceptions/EventNotDispatchedException.js";
import { EventWorkerException } from "../events/exceptions/EventWorkerException.js";

describe("Event Exceptions", () => {
  describe("EventDispatchException", () => {
    test("should create exception with message", () => {
      const message = "Failed to dispatch event";
      const exception = new EventDispatchException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("EventDispatchException");
    });

    test("should create exception without message", () => {
      const exception = new EventDispatchException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Event Dispatch Exception");
      expect(exception.name).toBe("EventDispatchException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventDispatchException("Test error");
      }).toThrow(EventDispatchException);
    });
  });

  describe("EventDriverException", () => {
    test("should create exception with message", () => {
      const message = "Driver error occurred";
      const exception = new EventDriverException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("EventDriverException");
    });

    test("should create exception without message", () => {
      const exception = new EventDriverException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Event Driver Exception");
      expect(exception.name).toBe("EventDriverException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventDriverException("Test error");
      }).toThrow(EventDriverException);
    });
  });

  describe("EventWorkerException", () => {
    test("should create exception with message", () => {
      const message = "Worker processing failed";
      const exception = new EventWorkerException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("EventWorkerException");
    });

    test("should create exception without message", () => {
      const exception = new EventWorkerException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Event Worker Exception");
      expect(exception.name).toBe("EventWorkerException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventWorkerException("Test error");
      }).toThrow(EventWorkerException);
    });
  });

  describe("EventNotDispatchedException", () => {
    test("should create exception with message", () => {
      const message = "Event was not dispatched";
      const exception = new EventNotDispatchedException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("EventNotDispatchedException");
    });

    test("should create exception without message", () => {
      const exception = new EventNotDispatchedException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Event Not Dispatched Exception");
      expect(exception.name).toBe("EventNotDispatchedException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventNotDispatchedException("Test error");
      }).toThrow(EventNotDispatchedException);
    });
  });

  describe("EventMockException", () => {
    test("should create exception with message", () => {
      const message = "Mock event error";
      const exception = new EventMockException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("MockException");
    });

    test("should create exception without message", () => {
      const exception = new EventMockException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Mock Exception");
      expect(exception.name).toBe("MockException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventMockException("Test error");
      }).toThrow(EventMockException);
    });
  });

  describe("EventInvalidPayloadException", () => {
    test("should create exception with message", () => {
      const message = "Invalid payload provided";
      const exception = new EventInvalidPayloadException(message);
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe("EventInvalidPayloadException");
    });

    test("should create exception without message", () => {
      const exception = new EventInvalidPayloadException();
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe("Invalid payload");
      expect(exception.name).toBe("EventInvalidPayloadException");
    });

    test("should be throwable", () => {
      expect(() => {
        throw new EventInvalidPayloadException("Test error");
      }).toThrow(EventInvalidPayloadException);
    });
  });

  describe("Exception inheritance", () => {
    test("all exceptions should inherit from Error", () => {
      const exceptions = [
        EventDispatchException,
        EventDriverException,
        EventWorkerException,
        EventNotDispatchedException,
        EventMockException,
        EventInvalidPayloadException
      ];

      exceptions.forEach(ExceptionClass => {
        const exception = new ExceptionClass("test");
        expect(exception).toBeInstanceOf(Error);
      });
    });

    test("all exceptions should have unique names", () => {
      const exceptionInstances = [
        new EventDispatchException(),
        new EventDriverException(),
        new EventWorkerException(),
        new EventNotDispatchedException(),
        new EventMockException(),
        new EventInvalidPayloadException()
      ];

      const names = exceptionInstances.map(ex => ex.name);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe("Exception usage patterns", () => {
    test("should work in try-catch blocks", () => {
      try {
        throw new EventDispatchException("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(EventDispatchException);
        if (error instanceof EventDispatchException) {
          expect(error.message).toBe("Test error");
        }
      }
    });

    test("should work with async/await", async () => {
      const asyncFunction = async () => {
        throw new EventWorkerException("Async error");
      };

      await expect(asyncFunction()).rejects.toThrow(EventWorkerException);
    });

    test("should preserve stack trace", () => {
      const exception = new EventInvalidPayloadException("Stack trace test");
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
    });
  });
});

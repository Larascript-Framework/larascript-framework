import { AdapterException } from "@/exceptions/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import SimpleService, { MockAdapterA, MockAdapterB } from "./SimpleService.js";

describe("BaseAdapter Tests", () => {
  let testAdapter: SimpleService;

  beforeEach(() => {
    testAdapter = new SimpleService();
  });

  describe("Adapter Management", () => {
    test("should add adapter successfully", () => {
      const adapter = new MockAdapterA();
      testAdapter.addSimpleAdapter("test", adapter);

      const retrieved = testAdapter.getAdapter("test");
      expect(retrieved).toBe(adapter);
    });

    test("should throw exception when adding duplicate adapter", () => {
      const adapter1 = new MockAdapterA();
      const adapter2 = new MockAdapterB();

      testAdapter.addSimpleAdapter("test", adapter1);

      expect(() => {
        testAdapter.addSimpleAdapter("test", adapter2);
      }).toThrow(AdapterException);
    });

    test("should throw exception when getting non-existent adapter", () => {
      expect(() => {
        testAdapter.getSimpleAdapter();
      }).toThrow(AdapterException);
    });
  });

  describe("Adapter Operations", () => {
    test("should perform basic adapter operations", async () => {
      const adapter = new MockAdapterA();
      testAdapter.addSimpleAdapter("test", adapter);

      // Test initial status
      expect(adapter.getStatus()).toBe("disconnected");
      expect(adapter.getName()).toBe("AdapterA");

      // Test connection
      const connected = await adapter.connect();
      expect(connected).toBe(true);
      expect(adapter.getStatus()).toBe("connected");

      // Test disconnection
      await adapter.disconnect();
      expect(adapter.getStatus()).toBe("disconnected");
    });

    test("should work with different adapter types", async () => {
      const adapterA = new MockAdapterA();
      const adapterB = new MockAdapterB();

      testAdapter.addSimpleAdapter("adapterA", adapterA);
      testAdapter.addSimpleAdapter("adapterB", adapterB);

      // Test both adapters
      expect(adapterA.getName()).toBe("AdapterA");
      expect(adapterB.getName()).toBe("AdapterB");

      await adapterA.connect();
      await adapterB.connect();

      expect(adapterA.getStatus()).toBe("connected");
      expect(adapterB.getStatus()).toBe("connected");
    });
  });

  describe("TestAdapter Integration", () => {
    test("should initialize with default adapter", () => {
      const adapter = testAdapter.getDefaultAdapter();
      expect(adapter).toBeInstanceOf(MockAdapterA);
      expect(adapter.getName()).toBe("AdapterA");
    });

    test("should demonstrate adapter operations through test method", async () => {
      // This test demonstrates the testAdapterOperations method
      const adapter = new MockAdapterA();
      testAdapter.addSimpleAdapter("test", adapter);

      // We can test the operations individually
      const connected = await adapter.connect();
      expect(connected).toBe(true);

      const status = adapter.getStatus();
      expect(status).toBe("connected");

      await adapter.disconnect();
      expect(adapter.getStatus()).toBe("disconnected");
    });
  });

  describe("Type Safety", () => {
    test("should maintain type safety with adapters", () => {
      const adapter = new MockAdapterA();
      testAdapter.addSimpleAdapter("simple", adapter);

      const retrieved = testAdapter.getAdapter("simple");

      // TypeScript should ensure this is a SimpleAdapter
      expect(typeof retrieved.connect).toBe("function");
      expect(typeof retrieved.disconnect).toBe("function");
      expect(typeof retrieved.getStatus).toBe("function");
      expect(typeof retrieved.getName).toBe("function");
    });
  });
});

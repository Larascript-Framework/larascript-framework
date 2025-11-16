import { BaseAdapter, BaseAdapterTypes } from "@/base/BaseAdapter.js";
export type { BaseAdapterTypes } from "@/base/BaseAdapter.js";

// Simple interface for a basic adapter
interface SimpleAdapter {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getStatus(): string;
  getName(): string;
}

// Define the adapter types for our test service
interface TestAdapterTypes extends BaseAdapterTypes {
  simple: SimpleAdapter;
  default: SimpleAdapter;
}

// Mock implementations for testing
class MockAdapterA implements SimpleAdapter {
  private connected: boolean = false;
  private name: string = "AdapterA";

  async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  getStatus(): string {
    return this.connected ? "connected" : "disconnected";
  }

  getName(): string {
    return this.name;
  }
}

class MockAdapterB implements SimpleAdapter {
  private connected: boolean = false;
  private name: string = "AdapterB";

  async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  getStatus(): string {
    return this.connected ? "connected" : "disconnected";
  }

  getName(): string {
    return this.name;
  }
}

/**
 * TestAdapter is a simple concrete implementation of BaseAdapter for testing purposes.
 * It demonstrates how to use the BaseAdapter pattern with a basic adapter interface.
 *
 * This class serves as both a test subject and an example of how to properly extend BaseAdapter
 * for real-world use cases.
 */
export default class SimpleService extends BaseAdapter<TestAdapterTypes> {
  /**
   * Initialize the test adapter with a default adapter
   */
  constructor() {
    super();
    this.initializeDefaultAdapter();
  }

  /**
   * Initialize default adapter for testing
   */
  private initializeDefaultAdapter(): void {
    this.addAdapterOnce("default", new MockAdapterA());
  }

  /**
   * Get the simple adapter
   */
  public getSimpleAdapter(): SimpleAdapter {
    return this.getAdapter("simple");
  }

  /**
   * Get the simple adapter
   */
  public getDefaultAdapter(): SimpleAdapter {
    return this.getAdapter("default");
  }

  /**
   * Add a simple adapter
   */
  public addSimpleAdapter(name: string, adapter: SimpleAdapter): void {
    this.addAdapterOnce(name, adapter);
  }

  /**
   * Test method to demonstrate adapter usage
   */
  public async testAdapterOperations(): Promise<void> {
    const adapter = this.getSimpleAdapter();

    // Test connection
    const connected = await adapter.connect();
    console.log(`${adapter.getName()} connected:`, connected);

    // Test status
    const status = adapter.getStatus();
    console.log(`${adapter.getName()} status:`, status);

    // Test disconnection
    await adapter.disconnect();
    console.log(`${adapter.getName()} disconnected`);
  }
}

// Export mock adapters for testing
export { MockAdapterA, MockAdapterB, type SimpleAdapter, type TestAdapterTypes };

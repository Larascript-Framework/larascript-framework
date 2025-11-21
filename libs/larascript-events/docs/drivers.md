# Event Drivers

Event drivers are responsible for handling how events are processed and executed. The event system supports multiple driver types, each designed for different use cases and processing requirements.

## Overview

Drivers implement the `IEventDriver` interface and extend the `BaseDriver` class. They determine:

- How events are executed (synchronously, asynchronously, or queued)
- When events are processed (immediately or delayed)
- How failures are handled (retries, error handling)
- Where events are stored (memory, database, external queues)

## Built-in Drivers

### SyncDriver

The `SyncDriver` executes events immediately and synchronously. This is the simplest driver and is ideal for:

- Development and testing
- Critical events that must complete before continuing
- Simple event processing without background workers

```typescript
import { SyncDriver, BaseEvent } from '@larascript-framework/larascript-events';

class SyncDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    await event.execute();
  }
}

// Usage
const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
  }
});
```

**Characteristics:**
- ✅ Immediate execution
- ✅ Simple to use and debug
- ✅ No external dependencies
- ❌ Blocks the calling thread
- ❌ No retry mechanism
- ❌ No persistence

### Queue Driver Example

The following is an example of how you could implement a `QueueDriver` to store events in a database queue for background processing. This would be ideal for:

- Production environments
- Long-running tasks
- High-volume event processing
- Reliable event delivery with retries

```typescript
// Example implementation (not included in this package)
import { BaseDriver, EventConfig } from '@larascript-framework/larascript-events';

class QueueDriver extends BaseDriver {
  // Implementation would go here
  // This is just an example of what you could build
}

const config = EventConfig.create({
  defaultDriver: SyncDriver, // Use custom queue driver for production
  drivers: {
    // Add custom queue driver implementation here if needed
  }
});
```

**Characteristics (for a queue driver implementation):**
- ✅ Non-blocking execution
- ✅ Persistent storage
- ✅ Retry mechanism
- ✅ Background processing
- ❌ Requires database setup
- ❌ More complex configuration

## Driver Configuration

### Basic Driver Setup

```typescript
import { EventConfig, SyncDriver } from '@larascript-framework/larascript-events';

const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
    // Add custom queue driver implementation here if needed
  }
});
```

### Queue Driver Options (Example)

If you implement a custom queue driver, it could support configuration options like:

```typescript
interface IQueableDriverOptions {
  retries: number;                    // Number of retry attempts
  runAfterSeconds: number;           // Delay before execution
  workerCreator: IWorkerCreatorConstructor; // Worker model creator
  runOnce?: boolean;                 // Execute only once
}
```

**Configuration Examples (for custom queue driver):**

```typescript
// Immediate execution with 3 retries
const immediateConfig = EventConfig.createConfigDriver(YourQueueDriver, {
  retries: 3,
  runAfterSeconds: 0,
  workerCreator: WorkerCreator
});

// Delayed execution (30 seconds) with 5 retries
const delayedConfig = EventConfig.createConfigDriver(YourQueueDriver, {
  retries: 5,
  runAfterSeconds: 30,
  workerCreator: WorkerCreator
});

// One-time execution
const onceConfig = EventConfig.createConfigDriver(YourQueueDriver, {
  retries: 1,
  runAfterSeconds: 0,
  workerCreator: WorkerCreator,
  runOnce: true
});
```

## Creating Custom Drivers

### Extending BaseDriver

```typescript
import { BaseDriver, IBaseEvent } from '@larascript-framework/larascript-events';

interface CustomDriverOptions {
  timeout: number;
  maxConcurrency: number;
  customOption: string;
}

class CustomDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    const options = this.getOptions<CustomDriverOptions>();
    
    if (!options) {
      throw new Error('Custom driver options not configured');
    }
    
    // Custom dispatch logic
    await this.processEventWithTimeout(event, options.timeout);
  }
  
  private async processEventWithTimeout(event: IBaseEvent, timeout: number): Promise<void> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Event execution timeout')), timeout);
    });
    
    const executionPromise = event.execute();
    
    await Promise.race([executionPromise, timeoutPromise]);
  }
}
```

### Driver with Retry Logic

```typescript
class RetryDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    const options = this.getOptions<{ maxRetries: number; delayMs: number }>();
    const maxRetries = options?.maxRetries ?? 3;
    const delayMs = options?.delayMs ?? 1000;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await event.execute();
        return; // Success
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    
    throw new Error(`Event failed after ${maxRetries} attempts: ${lastError?.message}`);
  }
}
```

### Async Driver with Concurrency Control

```typescript
class AsyncDriver extends BaseDriver {
  private activeExecutions = 0;
  private maxConcurrency: number;
  
  constructor() {
    super();
    this.maxConcurrency = 5; // Default concurrency
  }
  
  async dispatch(event: IBaseEvent): Promise<void> {
    const options = this.getOptions<{ maxConcurrency?: number }>();
    this.maxConcurrency = options?.maxConcurrency ?? this.maxConcurrency;
    
    // Wait if at max concurrency
    while (this.activeExecutions >= this.maxConcurrency) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.activeExecutions++;
    
    try {
      await event.execute();
    } finally {
      this.activeExecutions--;
    }
  }
}
```

## Driver Selection

### Automatic Driver Selection

```typescript
// Events can specify their preferred driver
class UserCreatedEvent extends BaseEvent<{ userId: string }> {
  getDriverName(): string {
    return 'queue'; // Use queue driver for this event
  }
  
  async execute(): Promise<void> {
    // Event logic
  }
}
```

### Manual Driver Override

```typescript
// Override driver when dispatching
await eventService.dispatch(event, 'sync'); // Force sync execution
await eventService.dispatch(event, 'queue'); // Force queue execution
```

### Conditional Driver Selection

```typescript
class SmartEventService extends EventService {
  async dispatch(event: IBaseEvent, overrideDriverName?: string): Promise<void> {
    let driverName = overrideDriverName;
    
    if (!driverName) {
      // Auto-select driver based on event type
      if (event instanceof CriticalEvent) {
        driverName = 'sync';
      } else if (event instanceof BackgroundEvent) {
        driverName = 'queue';
      } else {
        driverName = this.getDefaultDriverCtor().name.toLowerCase();
      }
    }
    
    await super.dispatch(event, driverName);
  }
}
```

## Driver Testing

### Testing Custom Drivers

```typescript
describe('CustomDriver', () => {
  let driver: CustomDriver;
  
  beforeEach(() => {
    driver = new CustomDriver();
    driver.setOptions({
      timeout: 1000,
      maxConcurrency: 3,
      customOption: 'test'
    });
  });
  
  it('should execute events successfully', async () => {
    const event = new TestEvent(payload);
    await expect(driver.dispatch(event)).resolves.not.toThrow();
  });
  
  it('should handle timeouts', async () => {
    const slowEvent = new SlowEvent(payload);
    await expect(driver.dispatch(slowEvent)).rejects.toThrow('Event execution timeout');
  });
});
```

### Mocking Drivers

```typescript
class MockDriver extends BaseDriver {
  private dispatchedEvents: IBaseEvent[] = [];
  
  async dispatch(event: IBaseEvent): Promise<void> {
    this.dispatchedEvents.push(event);
    // Don't actually execute the event
  }
  
  getDispatchedEvents(): IBaseEvent[] {
    return this.dispatchedEvents;
  }
  
  clear(): void {
    this.dispatchedEvents = [];
  }
}
```

## Performance Considerations

### Driver Performance Characteristics

| Driver | Execution Time | Memory Usage | CPU Usage | Reliability |
|--------|---------------|--------------|-----------|-------------|
| SyncDriver | Immediate | Low | High | Low |
| Custom Queue Driver | Delayed | Medium | Low | High |
| CustomDriver | Variable | Variable | Variable | Variable |

### Choosing the Right Driver

```typescript
// Use SyncDriver for:
// - Critical events that must complete immediately
// - Development and testing
// - Simple event processing

// Use a custom Queue Driver for:
// - Background processing
// - High-volume events
// - Long-running tasks
// - Production environments

// Use CustomDriver for:
// - Specialized processing requirements
// - Integration with external systems
// - Custom retry logic
// - Performance optimization
```

## Error Handling

### Driver-Specific Error Handling

```typescript
class ResilientDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    try {
      await event.execute();
    } catch (error) {
      // Log error
      console.error(`Event execution failed: ${event.getName()}`, error);
      
      // Determine if we should retry
      if (this.shouldRetry(error)) {
        await this.retryEvent(event);
      } else {
        // Move to failed queue
        await this.moveToFailedQueue(event, error);
      }
    }
  }
  
  private shouldRetry(error: Error): boolean {
    // Retry on network errors, not on validation errors
    return error.message.includes('network') || error.message.includes('timeout');
  }
  
  private async retryEvent(event: IBaseEvent): Promise<void> {
    // Implement retry logic
  }
  
  private async moveToFailedQueue(event: IBaseEvent, error: Error): Promise<void> {
    // Move to failed queue for manual inspection
  }
}
```

## Best Practices

### 1. Use Appropriate Drivers for Use Cases

```typescript
// Critical user actions - use sync
await eventService.dispatch(new UserLoginEvent(userData), 'sync');

// Background processing - use queue
await eventService.dispatch(new EmailNotificationEvent(emailData), 'queue');

// Custom processing - use custom driver
await eventService.dispatch(new ExternalApiEvent(apiData), 'custom');
```

### 2. Configure Drivers Properly

```typescript
// Production queue configuration (example with custom driver)
const prodQueueConfig = EventConfig.createConfigDriver(YourQueueDriver, {
  retries: 5,
  runAfterSeconds: 0,
  workerCreator: WorkerCreator
});

// Development sync configuration
const devSyncConfig = EventConfig.createConfigDriver(SyncDriver);
```

### 3. Monitor Driver Performance

```typescript
class MonitoredDriver extends BaseDriver {
  private metrics = {
    totalDispatches: 0,
    successfulDispatches: 0,
    failedDispatches: 0,
    averageExecutionTime: 0
  };
  
  async dispatch(event: IBaseEvent): Promise<void> {
    this.metrics.totalDispatches++;
    const startTime = Date.now();
    
    try {
      await event.execute();
      this.metrics.successfulDispatches++;
    } catch (error) {
      this.metrics.failedDispatches++;
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.updateAverageExecutionTime(executionTime);
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

### 4. Handle Driver Failures Gracefully

```typescript
class FallbackDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    try {
      await this.primaryDriver.dispatch(event);
    } catch (error) {
      console.warn('Primary driver failed, falling back to sync driver');
      await this.fallbackDriver.dispatch(event);
    }
  }
}
```

## Troubleshooting

### Common Driver Issues

1. **SyncDriver blocking execution**: Use a custom queue driver for long-running events
2. **Custom queue driver not processing events**: Check worker service is running
3. **Custom driver not receiving options**: Ensure `setOptions()` is called
4. **Driver selection not working**: Verify driver name matches configuration

### Debug Driver Issues

```typescript
class DebugDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    console.log(`[DEBUG] Dispatching event: ${event.getName()}`);
    console.log(`[DEBUG] Event payload:`, event.getPayload());
    console.log(`[DEBUG] Driver options:`, this.getOptions());
    
    try {
      await event.execute();
      console.log(`[DEBUG] Event executed successfully`);
    } catch (error) {
      console.error(`[DEBUG] Event execution failed:`, error);
      throw error;
    }
  }
}
```

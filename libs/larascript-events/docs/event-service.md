# Event Service

The `EventService` is the core component of the event system that manages event dispatching, configuration, and driver management. This document covers all aspects of using the event service.

## Overview

The `EventService` implements the `IEventService` interface and provides:

- Event dispatching with driver selection
- Configuration management
- Driver option retrieval
- Event and subscriber discovery
- Registry integration

## Basic Usage

### Creating an Event Service

```typescript
import { EventService, EventConfig, SyncDriver } from '@larascript-framework/larascript-events';

const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
  }
});

const eventService = new EventService(config);
```

### Dispatching Events

```typescript
import { BaseEvent } from '@larascript-framework/larascript-events';

class UserCreatedEvent extends BaseEvent<{ userId: string; email: string }> {
  async execute(): Promise<void> {
    console.log(`User created: ${this.getPayload().userId}`);
  }

  getQueueName(): string {
    return 'user-events';
  }
}

// Dispatch an event
const event = new UserCreatedEvent({ userId: '123', email: 'user@example.com' });
await eventService.dispatch(event);
```

### Dispatching with Custom Driver

```typescript
// Dispatch with specific driver
await eventService.dispatch(event, 'queue');

// Dispatch with default driver
await eventService.dispatch(event);
```

## Service Methods

### Configuration Management

```typescript
// Get current configuration
const config = eventService.getConfig();

// Register configuration (called automatically)
eventService.registerConfig();

// Get default driver constructor
const defaultDriver = eventService.getDefaultDriverCtor();
```

### Driver Management

```typescript
// Get driver options for a specific driver instance
const driverOptions = eventService.getDriverOptions(driverInstance);

// Get driver options by driver name
const queueOptions = eventService.getDriverOptionsByName('queue');

// Check if driver exists
const hasDriver = eventService.getDriverOptionsByName('custom') !== undefined;
```

### Event Discovery

```typescript
// Get event constructor by event name
const eventCtor = eventService.getEventCtorByName('UserCreated');

if (eventCtor) {
  const event = new eventCtor(payload);
  await eventService.dispatch(event);
}

// Get all registered events
const events = EventRegistry.getEvents();
```

### Subscriber Management

```typescript
// Get subscribers for a specific event
const subscribers = eventService.getSubscribers('UserCreated');

// Check if event has subscribers
const hasSubscribers = subscribers.length > 0;

// Execute subscribers manually
for (const SubscriberCtor of subscribers) {
  const subscriber = new SubscriberCtor(payload);
  await subscriber.execute();
}
```

## Advanced Usage

### Custom Event Dispatching Logic

```typescript
class CustomEventService extends EventService {
  async dispatch(event: IBaseEvent, overrideDriverName?: string): Promise<void> {
    // Pre-dispatch logic
    console.log(`Dispatching event: ${event.getName()}`);
    
    // Call parent dispatch
    await super.dispatch(event, overrideDriverName);
    
    // Post-dispatch logic
    console.log(`Event dispatched successfully: ${event.getName()}`);
  }
}
```

### Event Dispatching with Error Handling

```typescript
async function dispatchWithRetry(event: IBaseEvent, maxRetries = 3): Promise<void> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await eventService.dispatch(event);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      console.warn(`Dispatch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw new Error(`Failed to dispatch event after ${maxRetries} attempts: ${lastError?.message}`);
}
```

### Batch Event Dispatching

```typescript
async function dispatchBatch(events: IBaseEvent[]): Promise<void> {
  const promises = events.map(event => eventService.dispatch(event));
  await Promise.all(promises);
}

// Or with concurrency control
async function dispatchBatchWithConcurrency(events: IBaseEvent[], concurrency = 5): Promise<void> {
  const chunks = [];
  for (let i = 0; i < events.length; i += concurrency) {
    chunks.push(events.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(event => eventService.dispatch(event)));
  }
}
```

## Testing with Event Service

### Mocking Events

```typescript
// Mock events for testing
eventService.mockEvent(UserCreatedEvent);

// Dispatch events (they won't actually execute)
await eventService.dispatch(new UserCreatedEvent(payload));

// Check if events were dispatched
const dispatchedEvents = eventService.getMockedEvents();
expect(dispatchedEvents).toHaveLength(1);
```

### Testing Event Dispatching

```typescript
describe('EventService', () => {
  let eventService: EventService;
  
  beforeEach(() => {
    const config = EventConfig.create({
      defaultDriver: SyncDriver,
      drivers: {
        'sync': EventConfig.createConfigDriver(SyncDriver)
      }
    });
    
    eventService = new EventService(config);
  });
  
  it('should dispatch events successfully', async () => {
    const event = new UserCreatedEvent({ userId: '123', email: 'test@example.com' });
    await expect(eventService.dispatch(event)).resolves.not.toThrow();
  });
  
  it('should use correct driver', async () => {
    const event = new UserCreatedEvent(payload);
    const spy = jest.spyOn(SyncDriver.prototype, 'dispatch');
    
    await eventService.dispatch(event);
    
    expect(spy).toHaveBeenCalledWith(event);
  });
});
```

## Error Handling

### Common Exceptions

```typescript
import { 
  EventDispatchException, 
  EventNotDispatchedException,
  EventInvalidPayloadException 
} from '@larascript-framework/larascript-events';

try {
  await eventService.dispatch(event);
} catch (error) {
  if (error instanceof EventDispatchException) {
    console.error('Event dispatch failed:', error.message);
  } else if (error instanceof EventInvalidPayloadException) {
    console.error('Invalid event payload:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Custom Error Handling

```typescript
class ResilientEventService extends EventService {
  async dispatch(event: IBaseEvent, overrideDriverName?: string): Promise<void> {
    try {
      await super.dispatch(event, overrideDriverName);
    } catch (error) {
      // Log error but don't fail
      console.error(`Event dispatch failed for ${event.getName()}:`, error);
      
      // Optionally retry with different driver
      if (overrideDriverName !== 'sync') {
        console.log('Retrying with sync driver...');
        await super.dispatch(event, 'sync');
      }
    }
  }
}
```

## Performance Considerations

### Driver Selection

```typescript
// Use sync driver for immediate execution
await eventService.dispatch(urgentEvent, 'sync');

// Use queue driver for background processing
await eventService.dispatch(backgroundEvent, 'queue');
```

### Batch Processing

```typescript
// Process events in batches for better performance
const events = [/* large array of events */];
const batchSize = 100;

for (let i = 0; i < events.length; i += batchSize) {
  const batch = events.slice(i, i + batchSize);
  await Promise.all(batch.map(event => eventService.dispatch(event)));
}
```

## Best Practices

### 1. Use Appropriate Drivers

```typescript
// Immediate execution for critical events
await eventService.dispatch(criticalEvent, 'sync');

// Background processing for non-critical events
await eventService.dispatch(backgroundEvent, 'queue');
```

### 2. Handle Errors Gracefully

```typescript
async function safeDispatch(event: IBaseEvent): Promise<void> {
  try {
    await eventService.dispatch(event);
  } catch (error) {
    console.error(`Failed to dispatch ${event.getName()}:`, error);
    // Don't let event failures crash the application
  }
}
```

### 3. Monitor Event Dispatching

```typescript
class MonitoredEventService extends EventService {
  private dispatchCount = 0;
  private errorCount = 0;
  
  async dispatch(event: IBaseEvent, overrideDriverName?: string): Promise<void> {
    this.dispatchCount++;
    const startTime = Date.now();
    
    try {
      await super.dispatch(event, overrideDriverName);
      console.log(`Event dispatched in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }
  
  getStats() {
    return {
      totalDispatches: this.dispatchCount,
      errors: this.errorCount,
      successRate: (this.dispatchCount - this.errorCount) / this.dispatchCount
    };
  }
}
```

### 4. Use Type Safety

```typescript
// Define event types
interface UserEvents {
  UserCreated: { userId: string; email: string };
  UserDeleted: { userId: string };
}

// Type-safe event dispatching
function dispatchUserEvent<K extends keyof UserEvents>(
  eventName: K, 
  payload: UserEvents[K]
): Promise<void> {
  const eventCtor = eventService.getEventCtorByName(eventName);
  if (!eventCtor) {
    throw new Error(`Event ${eventName} not found`);
  }
  
  const event = new eventCtor(payload);
  return eventService.dispatch(event);
}
```

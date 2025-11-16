# @larascript-framework/larascript-events

A comprehensive event system for the Larascript framework that provides event dispatching, listening, and management capabilities with support for multiple drivers and worker services.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
  - [Configuration](./docs/config.md) - Event system configuration and setup
  - [Event Service](./docs/event-service.md) - Core event service and dispatching
  - [Drivers](./docs/drivers.md) - Event drivers (sync, async, queue-based)
  - [Events](./docs/events.md) - Creating events, listeners, and subscribers
  - [Workers](./docs/workers.md) - Background worker processing
- [Installation](#installation)
- [License](#license)

## Features

- **Event Dispatching**: Dispatch events with payload validation and driver support
- **Event Listening**: Register and manage event listeners and subscribers
- **Multiple Drivers**: Support for different event drivers (sync, async, queue-based)
- **Worker Services**: Background processing capabilities for long-running events
- **Event Registry**: Centralized event registration and management
- **Payload Validation**: Automatic JSON serialization validation
- **Mock Support**: Built-in mocking for testing
- **TypeScript Support**: Full TypeScript support with type safety

## Quick Start

```typescript
import { BaseEvent, EventRegistry, EventService, EventConfig } from '@larascript-framework/larascript-events';

// Create an event
class UserCreatedEvent extends BaseEvent<{ userId: string; email: string }> {
  async execute(): Promise<void> {
    console.log(`User created: ${this.getPayload().userId}`);
  }

  getQueueName(): string {
    return 'user-events';
  }
}

// Register the event
export default EventRegistry.register(UserCreatedEvent);

// Create event service and dispatch
const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver),
    // Add custom queue driver implementation here if needed
  }
});

const eventService = new EventService(config);
await eventService.dispatch(new UserCreatedEvent({ userId: '123', email: 'user@example.com' }));
```

## Documentation

For detailed information about each component, see the following documentation:

- **[Configuration](./config.md)** - Event system configuration and setup
- **[Event Service](./event-service.md)** - Core event service and dispatching
- **[Drivers](./drivers.md)** - Event drivers (sync, async, queue-based)
- **[Events](./events.md)** - Creating events, listeners, and subscribers
- **[Workers](./workers.md)** - Background worker processing

## Installation

```bash
npm install larascript-framework/larascript-events
```

## License

ISC License - see the [LICENSE](../LICENSE) file for details.

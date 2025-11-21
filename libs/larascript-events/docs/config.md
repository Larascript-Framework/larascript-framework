# Event System Configuration

The event system configuration is the foundation for setting up event dispatching, drivers, and worker processing. This document covers all configuration options and setup procedures.

## Overview

The event system uses a centralized configuration approach through the `EventConfig` class. This configuration defines:

- Default and custom event drivers
- Driver-specific options
- Event listeners and subscribers
- Worker processing settings
- Registry management

## Basic Configuration

### Creating Event Configuration

```typescript
import { EventConfig, SyncDriver } from '@larascript-framework/larascript-events';

const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
    // Add custom queue driver implementation here if needed
  },
  listeners: []
});
```

### Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `defaultDriver` | `TClassConstructor<IEventDriver>` | Default driver for events | Yes |
| `drivers` | `Record<string, IEventDriversConfigOption>` | Custom driver configurations | No |
| `listeners` | `IEventListenersConfig` | Event listener configurations | No |

## Driver Configuration

### Creating Driver Configurations

```typescript
// Basic driver configuration
const syncDriverConfig = EventConfig.createConfigDriver(SyncDriver);

// Driver with custom options (example with custom queue driver)
const queueDriverConfig = EventConfig.createConfigDriver(YourQueueDriver, {
  retries: 5,
  runAfterSeconds: 30,
  workerCreator: WorkerCreator,
  runOnce: true
});
```

### Queue Driver Options (Example)

If you implement a custom queue driver, it could support configuration options for background processing:

```typescript
interface IQueableDriverOptions {
  retries: number;                    // Number of retry attempts
  runAfterSeconds: number;           // Delay before execution
  workerCreator: IWorkerCreatorConstructor; // Worker model creator
  runOnce?: boolean;                 // Execute only once
}
```

### Custom Driver Configuration

You can create custom drivers with their own configuration options:

```typescript
class CustomDriver extends BaseDriver {
  async dispatch(event: IBaseEvent): Promise<void> {
    const options = this.getOptions<CustomDriverOptions>();
    // Custom dispatch logic
  }
}

const customConfig = EventConfig.createConfigDriver(CustomDriver, {
  customOption: 'value',
  timeout: 5000
});
```

## Listener Configuration

### Basic Listener Setup

```typescript
const config = EventConfig.create({
  defaultDriver: SyncDriver,
  listeners: [
    {
      listener: UserCreatedListener,
      subscribers: [EmailSubscriber, NotificationSubscriber]
    }
  ]
});
```

### Advanced Listener Configuration

```typescript
const config = EventConfig.create({
  defaultDriver: SyncDriver,
  listeners: [
    {
      listener: OrderCreatedListener,
      subscribers: [
        InventorySubscriber,
        PaymentSubscriber,
        ShippingSubscriber
      ]
    },
    {
      listener: UserDeletedListener,
      subscribers: [CleanupSubscriber]
    }
  ]
});
```

## Event Service Configuration

### Creating Event Service

```typescript
import { EventService } from '@larascript-framework/larascript-events';

const eventService = new EventService(config);

// Register configuration
eventService.registerConfig();
```

### Service Configuration Methods

```typescript
// Get configuration
const currentConfig = eventService.getConfig();

// Get default driver
const defaultDriver = eventService.getDefaultDriverCtor();

// Get driver options
const driverOptions = eventService.getDriverOptions(driverInstance);
const driverOptionsByName = eventService.getDriverOptionsByName('queue');

// Get event constructor by name
const eventCtor = eventService.getEventCtorByName('UserCreated');

// Get subscribers for an event
const subscribers = eventService.getSubscribers('UserCreated');
```

## Framework Integration

### Provider Configuration

In your Larascript framework application, configure the event system through providers:

```typescript
// config/providers.config.ts
import { IEventService, IWorkerService } from '@larascript-framework/larascript-events';

export default {
  // ... other providers
  "events": IEventService,
  "events.worker": IWorkerService
};
```

### Service Registration

```typescript
// app/providers/EventServiceProvider.ts
import { IEventService } from '@larascript-framework/larascript-events';
import { EventService } from '@src/core/domains/events/services/EventService';

export class EventServiceProvider {
  register(app: any): void {
    app.bind(IEventService, () => {
      const config = EventConfig.create({
        defaultDriver: SyncDriver,
        drivers: {
          'sync': EventConfig.createConfigDriver(SyncDriver),
          // Add custom queue driver implementation here if needed
        }
      });
      
      return new EventService(config);
    });
  }
}
```

## Environment-Specific Configuration

### Development Configuration

```typescript
const devConfig = EventConfig.create({
  defaultDriver: SyncDriver, // Immediate execution for development
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
  }
});
```

### Production Configuration

```typescript
const prodConfig = EventConfig.create({
  defaultDriver: SyncDriver, // Use custom queue driver for production if needed
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
    // Add custom queue driver implementation here for production
  }
});
```

### Testing Configuration

```typescript
const testConfig = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    'sync': EventConfig.createConfigDriver(SyncDriver)
  },
  listeners: [] // Minimal listeners for testing
});
```

## Configuration Validation

The event system automatically validates configuration options:

```typescript
// Invalid configuration will throw errors
try {
  const config = EventConfig.create({
    defaultDriver: SyncDriver,
    drivers: {
      // Add custom queue driver implementation here if needed
    }
  });
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Best Practices

### 1. Use Environment-Specific Configurations

```typescript
const config = process.env.NODE_ENV === 'production' 
  ? prodConfig 
  : devConfig;
```

### 2. Centralize Driver Options

```typescript
const queueDriverOptions = {
  retries: 3,
  runAfterSeconds: 0,
  workerCreator: WorkerCreator
};

const config = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    // Add custom queue driver implementation here if needed
  }
});
```


### 3. Use Type-Safe Configuration

```typescript
interface AppEventConfig {
  defaultDriver: typeof SyncDriver;
  drivers: {
    sync: IEventDriversConfigOption;
    queue: IEventDriversConfigOption;
  };
}

const config: AppEventConfig = EventConfig.create({
  defaultDriver: SyncDriver,
  drivers: {
    sync: EventConfig.createConfigDriver(SyncDriver),
    // Add custom queue driver implementation here if needed
  }
});
```

## Troubleshooting

### Common Configuration Issues

1. **Missing Default Driver**: Ensure `defaultDriver` is provided
2. **Invalid Driver Options**: Check that all required options are provided for custom drivers
3. **Circular Dependencies**: Avoid circular imports in driver configurations
4. **Missing Worker Creator**: Queue drivers require a worker creator

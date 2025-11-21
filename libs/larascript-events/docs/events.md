# Events, Listeners, and Subscribers

The event system provides three main components for handling events: **Events**, **Listeners**, and **Subscribers**. Understanding the differences and relationships between these components is crucial for building effective event-driven applications.

## Overview

### Component Hierarchy

```
Event (BaseEvent)
├── Listener (BaseEventListener) - Handles event logic
└── Subscriber (BaseEventSubscriber) - Responds to events
```

### Key Differences

| Component | Purpose | Execution | Registration | Type |
|-----------|---------|-----------|--------------|------|
| **Event** | Core event logic and payload | Direct execution | `EventRegistry.register()` | `'event'` |
| **Listener** | Pre-processing and coordination | Before subscribers | `EventRegistry.registerListener()` | `'listener'` |
| **Subscriber** | Event response and side effects | After listeners | `EventRegistry.registerSubscriber()` | `'subscriber'` |

## Events

Events are the core components that contain the main business logic and payload data.

### Creating Events

```typescript
import { BaseEvent, EventRegistry } from '@larascript-framework/larascript-events';

class UserCreatedEvent extends BaseEvent<{ userId: string; email: string; name: string }> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Core event logic
    console.log(`User created: ${payload.name} (${payload.email})`);
    
    // Business logic here
    await this.createUserProfile(payload.userId);
    await this.sendWelcomeEmail(payload.email);
  }

  getQueueName(): string {
    return 'user-events';
  }

  getDriverName(): string {
    return 'queue'; // Use queue driver for background processing
  }

  private async createUserProfile(userId: string): Promise<void> {
    // Create user profile logic
  }

  private async sendWelcomeEmail(email: string): Promise<void> {
    // Send welcome email logic
  }
}

// Register the event
export default EventRegistry.register(UserCreatedEvent);
```

### Event Features

#### Payload Validation

```typescript
class OrderCreatedEvent extends BaseEvent<{ orderId: string; amount: number; items: string[] }> {
  constructor(payload: { orderId: string; amount: number; items: string[] }) {
    super(payload);
    
    // Additional validation
    if (payload.amount <= 0) {
      throw new Error('Order amount must be greater than 0');
    }
    
    if (payload.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
  }

  async execute(): Promise<void> {
    const payload = this.getPayload();
    // Event logic
  }
}
```

#### Casting Support

```typescript
class ProductUpdatedEvent extends BaseEvent<{ productId: string; price: number; category: string }> {
  casts = {
    price: 'number',
    productId: 'string'
  };

  async execute(): Promise<void> {
    const payload = this.getPayload();
    // price is automatically cast to number
    console.log(`Product ${payload.productId} updated with price: $${payload.price}`);
  }
}
```

#### Queue and Driver Configuration

```typescript
class EmailNotificationEvent extends BaseEvent<{ to: string; subject: string; body: string }> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    await this.sendEmail(payload);
  }

  getQueueName(): string {
    return 'email-notifications';
  }

  getDriverName(): string {
    return 'queue'; // Use queue for email sending
  }

  private async sendEmail(payload: { to: string; subject: string; body: string }): Promise<void> {
    // Email sending logic
  }
}
```

## Listeners

Listeners are responsible for pre-processing events and coordinating the execution of subscribers. They execute **before** subscribers and can modify the event flow.

### Creating Listeners

```typescript
import { BaseEventListener, EventRegistry } from '@larascript-framework/larascript-events';

class UserCreatedListener extends BaseEventListener<{ userId: string; email: string; name: string }> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Pre-processing logic
    console.log(`Processing user creation for: ${payload.name}`);
    
    // Validate user data
    await this.validateUserData(payload);
    
    // Prepare data for subscribers
    await this.prepareUserData(payload);
  }

  private async validateUserData(payload: { userId: string; email: string; name: string }): Promise<void> {
    // Validation logic
    if (!payload.email.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  private async prepareUserData(payload: { userId: string; email: string; name: string }): Promise<void> {
    // Data preparation logic
    console.log('User data prepared for processing');
  }
}

// Register the listener
export default EventRegistry.registerListener(UserCreatedListener);
```

### Listener Use Cases

#### Data Validation and Preparation

```typescript
class OrderCreatedListener extends BaseEventListener<{ orderId: string; items: any[]; customerId: string }> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Validate order
    await this.validateOrder(payload);
    
    // Calculate totals
    const totals = await this.calculateTotals(payload.items);
    
    // Update payload with calculated data
    this.setPayload({
      ...payload,
      totals,
      status: 'validated'
    });
  }

  private async validateOrder(payload: { orderId: string; items: any[]; customerId: string }): Promise<void> {
    // Order validation logic
  }

  private async calculateTotals(items: any[]): Promise<{ subtotal: number; tax: number; total: number }> {
    // Calculate totals logic
    return { subtotal: 0, tax: 0, total: 0 };
  }
}
```

#### Coordination and Orchestration

```typescript
class PaymentProcessedListener extends BaseEventListener<{ paymentId: string; amount: number; status: string }> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Coordinate multiple operations
    await Promise.all([
      this.updateInventory(payload),
      this.notifyCustomer(payload),
      this.updateAnalytics(payload)
    ]);
  }

  private async updateInventory(payload: { paymentId: string; amount: number; status: string }): Promise<void> {
    // Inventory update logic
  }

  private async notifyCustomer(payload: { paymentId: string; amount: number; status: string }): Promise<void> {
    // Customer notification logic
  }

  private async updateAnalytics(payload: { paymentId: string; amount: number; status: string }): Promise<void> {
    // Analytics update logic
  }
}
```

## Subscribers

Subscribers respond to events and handle side effects. They execute **after** listeners and are responsible for specific actions in response to events.

### Creating Subscribers

```typescript
import { EventRegistry } from '@larascript-framework/larascript-events';
import { BaseEventSubscriber } from '@larascript-framework/larascript-events';
import SyncDriver from '@src/core/domains/events/drivers/SyncDriver';

class UserCreatedSubscriber extends BaseEventSubscriber<{ userId: string; email: string; name: string }> {
  protected namespace: string = 'auth';

  constructor(payload: { userId: string; email: string; name: string }) {
    super(payload, SyncDriver);
  }

  getQueueName(): string {
    return 'user-notifications';
  }

  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Send welcome email
    await this.sendWelcomeEmail(payload.email, payload.name);
    
    // Create user profile
    await this.createUserProfile(payload.userId);
    
    // Send notification to admin
    await this.notifyAdmin(payload);
  }

  private async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Sending welcome email to ${email} for user ${name}`);
  }

  private async createUserProfile(userId: string): Promise<void> {
    console.log(`Creating profile for user ${userId}`);
  }

  private async notifyAdmin(payload: { userId: string; email: string; name: string }): Promise<void> {
    console.log(`Notifying admin about new user: ${payload.name}`);
  }
}

// Register the subscriber
export default EventRegistry.registerSubscriber(UserCreatedSubscriber);
```

### Subscriber Use Cases

#### Email Notifications

```typescript
class EmailNotificationSubscriber extends BaseEventSubscriber<{ to: string; subject: string; body: string }> {
  protected namespace: string = 'notifications';

  constructor(payload: { to: string; subject: string; body: string }) {
    super(payload, SyncDriver);
  }

  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Send email
    await this.sendEmail(payload);
    
    // Log email sent
    await this.logEmailSent(payload);
  }

  private async sendEmail(payload: { to: string; subject: string; body: string }): Promise<void> {
    // Email sending logic
    console.log(`Sending email to ${payload.to}: ${payload.subject}`);
  }

  private async logEmailSent(payload: { to: string; subject: string; body: string }): Promise<void> {
    // Logging logic
  }
}
```

#### Database Updates

```typescript
class UserProfileUpdateSubscriber extends BaseEventSubscriber<{ userId: string; profileData: any }> {
  protected namespace: string = 'profiles';

  constructor(payload: { userId: string; profileData: any }) {
    super(payload, SyncDriver);
  }

  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Update user profile in database
    await this.updateProfile(payload.userId, payload.profileData);
    
    // Update search index
    await this.updateSearchIndex(payload.userId);
    
    // Clear cache
    await this.clearCache(payload.userId);
  }

  private async updateProfile(userId: string, profileData: any): Promise<void> {
    // Database update logic
  }

  private async updateSearchIndex(userId: string): Promise<void> {
    // Search index update logic
  }

  private async clearCache(userId: string): Promise<void> {
    // Cache clearing logic
  }
}
```

## Event Flow and Execution Order

### Complete Event Flow

```typescript
// 1. Event is dispatched
await eventService.dispatch(new UserCreatedEvent(userData));

// 2. Event executes (if using sync driver)
// UserCreatedEvent.execute() runs

// 3. Listener executes (if registered)
// UserCreatedListener.execute() runs

// 4. Subscribers execute (if registered)
// UserCreatedSubscriber.execute() runs
// EmailNotificationSubscriber.execute() runs
// UserProfileUpdateSubscriber.execute() runs
```

### Configuration Example

```typescript
const config = EventConfig.create({
  defaultDriver: SyncDriver,
  listeners: [
    {
      listener: UserCreatedListener,
      subscribers: [
        UserCreatedSubscriber,
        EmailNotificationSubscriber,
        UserProfileUpdateSubscriber
      ]
    },
    {
      listener: OrderCreatedListener,
      subscribers: [
        InventoryUpdateSubscriber,
        PaymentProcessingSubscriber,
        ShippingNotificationSubscriber
      ]
    }
  ]
});
```

## Registration and Discovery

### Event Registration

```typescript
// Register events
EventRegistry.register(UserCreatedEvent);
EventRegistry.register(OrderCreatedEvent);
EventRegistry.register(PaymentProcessedEvent);

// Get all registered events
const events = EventRegistry.getEvents();
```

### Listener Registration

```typescript
// Register listeners
EventRegistry.registerListener(UserCreatedListener);
EventRegistry.registerListener(OrderCreatedListener);

// Get listeners for an event
const listeners = EventRegistry.getListeners('UserCreated');
```

### Subscriber Registration

```typescript
// Register subscribers
EventRegistry.registerSubscriber(UserCreatedSubscriber);
EventRegistry.registerSubscriber(EmailNotificationSubscriber);

// Get subscribers for an event
const subscribers = EventRegistry.getSubscribers('UserCreated');
```

## Testing Events, Listeners, and Subscribers

### Testing Events

```typescript
describe('UserCreatedEvent', () => {
  it('should execute successfully', async () => {
    const event = new UserCreatedEvent({
      userId: '123',
      email: 'test@example.com',
      name: 'Test User'
    });

    await expect(event.execute()).resolves.not.toThrow();
  });

  it('should validate payload', () => {
    expect(() => {
      new UserCreatedEvent({
        userId: '',
        email: 'invalid-email',
        name: ''
      });
    }).toThrow();
  });
});
```

### Testing Listeners

```typescript
describe('UserCreatedListener', () => {
  it('should process user data', async () => {
    const listener = new UserCreatedListener({
      userId: '123',
      email: 'test@example.com',
      name: 'Test User'
    });

    await expect(listener.execute()).resolves.not.toThrow();
  });
});
```

### Testing Subscribers

```typescript
describe('UserCreatedSubscriber', () => {
  it('should send welcome email', async () => {
    const subscriber = new UserCreatedSubscriber({
      userId: '123',
      email: 'test@example.com',
      name: 'Test User'
    });

    const sendEmailSpy = jest.spyOn(subscriber, 'sendWelcomeEmail');
    
    await subscriber.execute();
    
    expect(sendEmailSpy).toHaveBeenCalledWith('test@example.com', 'Test User');
  });
});
```

## Best Practices

### 1. Separation of Concerns

```typescript
// Event: Core business logic
class OrderCreatedEvent extends BaseEvent<OrderData> {
  async execute(): Promise<void> {
    // Core order creation logic
    await this.createOrder();
  }
}

// Listener: Validation and preparation
class OrderCreatedListener extends BaseEventListener<OrderData> {
  async execute(): Promise<void> {
    // Validate order data
    await this.validateOrder();
    // Prepare data for processing
  }
}

// Subscriber: Side effects
class OrderCreatedSubscriber extends BaseEventSubscriber<OrderData> {
  async execute(): Promise<void> {
    // Send confirmation email
    // Update inventory
    // Notify shipping
  }
}
```

### 2. Error Handling

```typescript
class ResilientSubscriber extends BaseEventSubscriber<{ data: any }> {
  async execute(): Promise<void> {
    try {
      await this.processData();
    } catch (error) {
      // Log error but don't fail the entire event
      console.error('Subscriber failed:', error);
      
      // Optionally retry or move to failed queue
      await this.handleFailure(error);
    }
  }

  private async handleFailure(error: Error): Promise<void> {
    // Handle failure logic
  }
}
```

### 3. Type Safety

```typescript
// Define payload types
interface UserEventPayload {
  userId: string;
  email: string;
  name: string;
}

interface OrderEventPayload {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  total: number;
}

// Use typed events
class UserCreatedEvent extends BaseEvent<UserEventPayload> {
  async execute(): Promise<void> {
    const payload = this.getPayload(); // Typed as UserEventPayload
    // Event logic
  }
}
```

### 4. Performance Considerations

```typescript
// Use appropriate drivers for different components
class FastSubscriber extends BaseEventSubscriber<{ data: any }> {
  constructor(payload: { data: any }) {
    super(payload, SyncDriver); // Fast execution
  }
}

class BackgroundSubscriber extends BaseEventSubscriber<{ data: any }> {
  constructor(payload: { data: any }) {
    super(payload, SyncDriver); // Use custom queue driver for background processing
  }
}
```

## Common Patterns

### Event Sourcing

```typescript
class UserEventSourcingSubscriber extends BaseEventSubscriber<UserEventPayload> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Store event in event store
    await this.storeEvent(payload);
    
    // Update read model
    await this.updateReadModel(payload);
  }
}
```

### Saga Pattern

```typescript
class OrderSagaSubscriber extends BaseEventSubscriber<OrderEventPayload> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Start saga
    await this.startOrderSaga(payload);
    
    // Compensate if needed
    if (this.shouldCompensate()) {
      await this.compensate(payload);
    }
  }
}
```

### CQRS Pattern

```typescript
class UserQueryModelSubscriber extends BaseEventSubscriber<UserEventPayload> {
  async execute(): Promise<void> {
    const payload = this.getPayload();
    
    // Update query model
    await this.updateUserQueryModel(payload);
    
    // Invalidate cache
    await this.invalidateCache(payload.userId);
  }
}
```

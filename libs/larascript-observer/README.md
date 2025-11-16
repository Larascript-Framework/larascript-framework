# Larascript Observer

A TypeScript implementation of the Observer pattern for the Larascript Framework. This bundle provides a clean, type-safe way to handle lifecycle events in your application.

## Features

- **Lifecycle Events**: Built-in support for common CRUD operations (creating, created, updating, updated, saving, saved, deleting, deleted)
- **Custom Events**: Extensible system for custom event handling
- **Type Safety**: Full TypeScript support with generic types
- **Async Support**: All event handlers support async/await operations

## Installation

```bash
npm install ben-shepherd/larascript-observer
```

## Quick Start

### Basic Usage

```typescript
import { Observer } from '@ben-shepherd/larascript-observer';

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

class UserObserver extends Observer<User> {
  // Hash password before saving
  async saving(data: User): Promise<User> {
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }
    return data;
  }

  // Log when user is created
  async created(data: User): Promise<User> {
    console.log(`User created: ${data.email}`);
    return data;
  }

  // Custom event handler
  async onPasswordChange(data: User, newPassword: string): Promise<User> {
    data.password = await this.hashPassword(newPassword);
    console.log(`Password changed for user: ${data.email}`);
    return data;
  }

  private async hashPassword(password: string): Promise<string> {
    // Your password hashing logic here
    return `hashed_${password}`;
  }
}

// Usage in your model/service
class UserService {
  private observer = new UserObserver();

  async createUser(userData: User): Promise<User> {
    // Trigger creating event
    let processedData = await this.observer.on('creating', userData);
    
    // Your creation logic here
    const user = await this.saveToDatabase(processedData);
    
    // Trigger created event
    return await this.observer.on('created', user);
  }

  async changePassword(user: User, newPassword: string): Promise<User> {
    // Trigger custom event
    return await this.observer.onCustom('onPasswordChange', user, newPassword);
  }
}
```

### Available Events

| Event | Description | When Triggered |
|-------|-------------|----------------|
| `creating` | Before entity creation | Before saving new entity |
| `created` | After entity creation | After successful creation |
| `updating` | Before entity update | Before updating existing entity |
| `updated` | After entity update | After successful update |
| `saving` | Before any save operation | Before create or update |
| `saved` | After any save operation | After successful save |
| `deleting` | Before entity deletion | Before removing entity |
| `deleted` | After entity deletion | After successful deletion |

### Custom Events

Use the `onCustom` method to handle events not covered by the built-in lifecycle:

```typescript
// Trigger custom event
const result = await observer.onCustom('customEventName', data, ...additionalArgs);
```

## API Reference

### Observer Class

The main `Observer<T>` class provides:

- **Lifecycle Methods**: Override any of the 8 built-in event handlers
- **`on(event, data)`**: Trigger built-in lifecycle events
- **`onCustom(name, data, ...args)`**: Trigger custom events

### IHasObserver Interface

For classes that need to manage observers:

```typescript
interface IHasObserver {
  setObserverConstructor(observerConstructor: ObserveConstructor | undefined): void;
  getObserver(): IObserver | undefined;
  setObserveProperty(attribute: string, method: string): void;
}
```

## License

ISC

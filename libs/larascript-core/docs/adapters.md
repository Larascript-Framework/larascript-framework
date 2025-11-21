# Adapters

The Larascript Core Bundle provides a robust adapter pattern implementation through the `BaseAdapter` class, enabling type-safe component management with full TypeScript support.

## Overview

The `BaseAdapter<T>` class is the foundation for implementing component management patterns. It provides type-safe methods for managing collections of components, services, or any other modular elements.

## Key Features

- **Type-safe component management** with full TypeScript support
- **Duplicate prevention** - prevents registering components with the same name
- **Centralized component storage** and retrieval
- **Error handling** for missing or duplicate components
- **Generic type system** for compile-time type safety

## Core Components

### BaseAdapter<T>
The foundation class for implementing component management patterns. Provides type-safe methods for managing collections of components, services, or any other modular elements.

**Key Methods:**
- `addAdapterOnce(name, component)` - Safely add a component (prevents duplicates)
- `getAdapter(name)` - Retrieve a component by name (throws if not found)

**Type Safety:**
- Uses generic type parameter `AdapterTypes extends BaseAdapterTypes`
- Ensures all components conform to the specified interface
- Provides compile-time type checking

**Use Cases:**
- Service providers (authentication, payment, storage)
- Plugin systems
- Strategy patterns
- Factory implementations
- Any modular component architecture

### AdapterException
Custom exception class for handling component-related errors with descriptive messages.

## Usage Examples

### Basic Implementation

```typescript
import BaseAdapter, { BaseAdapterTypes } from "ben-shepherd/larascript-core";

// Define your component interface
interface StorageProvider {
  save(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
}

// Define component types for your service
interface StorageProviderTypes extends BaseAdapterTypes {
  local: StorageProvider;
  remote: StorageProvider;
  cache: StorageProvider;
}

// Extend BaseAdapter with your types
class StorageService extends BaseAdapter<StorageProviderTypes> {
  constructor() {
    super();
    // Initialize with default components
    this.addAdapterOnce("local", new LocalStorageProvider());
  }

  // Convenience methods
  public getLocalStorage(): StorageProvider {
    return this.getAdapter("local");
  }

  public getRemoteStorage(): StorageProvider {
    return this.getAdapter("remote");
  }

  public addStorageProvider(name: string, provider: StorageProvider): void {
    this.addAdapterOnce(name, provider);
  }
}
```

### Error Handling

```typescript
import AdapterException from "ben-shepherd/larascript-core";

try {
  const component = service.getAdapter("nonexistent");
} catch (error) {
  if (error instanceof AdapterException) {
    console.error("Component error:", error.message);
    // Handle component-specific errors
  }
}
```

### Type-Safe Component Management

```typescript
// The BaseAdapter ensures type safety
const storageService = new StorageService();

// This will be type-safe - TypeScript knows this returns StorageProvider
const localProvider = storageService.getAdapter("local");
await localProvider.save("key", "value");

// Adding components is also type-safe
storageService.addAdapterOnce("redis", new RedisProvider());
```

## Best Practices

### 1. Define Clear Interfaces
Create well-defined interfaces for your components to ensure consistency across implementations.

### 2. Use Descriptive Names
Choose meaningful names for your components to make the code self-documenting.

### 3. Initialize Default Components
Consider initializing commonly used components in the constructor for convenience.

### 4. Handle Exceptions Gracefully
Always wrap component operations in try-catch blocks and handle `AdapterException` appropriately.

### 5. Leverage Type Safety
Take advantage of TypeScript's type system by defining specific component types rather than using generic types.
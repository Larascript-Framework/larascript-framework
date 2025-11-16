# Dependency System

The Larascript Core Bundle provides a comprehensive dependency injection system that enables type-safe service resolution, dependency management, and container orchestration. This system is built around the `AppSingleton` class and integrates seamlessly with the kernel's provider system.

## Overview

The dependency system consists of several key components:

- **AppSingleton** - The main dependency loader and container manager
- **DependencyLoader** - Type-safe container access interface
- **RequiresDependency** - Interface for services that need dependency injection
- **Container System** - Type-safe storage and retrieval of application dependencies

## Core Components

### AppSingleton

The `AppSingleton` class is the central hub for dependency management, providing methods to set, get, and manage containers in a type-safe manner.

**Key Methods:**

- `container<T, K>(name: K): T[K]` - Retrieve a container by name with full type safety
- `safeContainer<K>(name: K): Containers[K] | undefined` - Safely retrieve a container (returns undefined if not found)
- `setContainer<Name>(name: Name, container: Containers[Name])` - Set a container in the kernel
- `containerReady<K>(name: K): boolean` - Check if a container is ready
- `env(): string | undefined` - Get the current application environment

### DependencyLoader

A type alias that provides a standardized interface for dependency loading:

```typescript
type DependencyLoader = <T extends Containers, K extends keyof T>(name: K) => T[K];
```

### RequiresDependency

Interface for services that require dependency injection:

```typescript
interface RequiresDependency {
  setDependencyLoader(loader: DependencyLoader): void;
}
```

## Usage Examples

### Basic Container Access

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

// Define your container types
interface AppContainers {
  database: DatabaseService;
  logger: LoggerService;
  cache: CacheService;
}

// Access containers with full type safety
const database = AppSingleton.container<AppContainers, "database">("database");
const logger = AppSingleton.container<AppContainers, "logger">("logger");

// Use the services
await database.connect();
logger.info("Database connected successfully");
```

### Safe Container Access

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

// Safe access that won't throw if container doesn't exist
const cache = AppSingleton.safeContainer<AppContainers, "cache">("cache");

if (cache) {
  await cache.set("key", "value");
} else {
  console.log("Cache service not available");
}
```

### Container Readiness Check

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

// Check if a container is ready before using it
if (AppSingleton.containerReady<AppContainers, "database">("database")) {
  const database = AppSingleton.container<AppContainers, "database">("database");
  await database.connect();
} else {
  console.log("Database service not ready");
}
```

### Services with Dependencies

```typescript
import { RequiresDependency, DependencyLoader } from "ben-shepherd/larascript-core";

class DatabaseService implements RequiresDependency {
  private logger!: LoggerService;
  
  constructor(private config: DatabaseConfig) {}
  
  setDependencyLoader(loader: DependencyLoader): void {
    // Inject the logger dependency
    this.logger = loader<AppContainers, "logger">("logger");
  }
  
  async connect(): Promise<boolean> {
    try {
      // Use the injected logger
      this.logger.info("Connecting to database...");
      // ... connection logic
      this.logger.info("Database connected successfully");
      return true;
    } catch (error) {
      this.logger.error("Database connection failed", error);
      return false;
    }
  }
}
```

### Provider Integration

```typescript
import { BaseProvider } from "ben-shepherd/larascript-core";

class DatabaseProvider extends BaseProvider {
  async register(): Promise<void> {
    // Create the database service
    const database = new DatabaseService({
      host: "localhost",
      port: 5432,
      database: "myapp"
    });
    
    // Set up dependency injection
    database.setDependencyLoader(AppSingleton.container);
    
    // Bind to container
    this.bind("database", database);
  }
  
  async boot(): Promise<void> {
    // Boot logic if needed
    const database = AppSingleton.container<AppContainers, "database">("database");
    await database.connect();
  }
}
```

## Advanced Patterns

### Conditional Dependencies

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

class FeatureService {
  private cache?: CacheService;
  
  constructor() {
    // Conditionally inject cache if available
    this.cache = AppSingleton.safeContainer<AppContainers, "cache">("cache");
  }
  
  async getData(key: string): Promise<any> {
    // Use cache if available, otherwise fetch from source
    if (this.cache) {
      const cached = await this.cache.get(key);
      if (cached) return cached;
    }
    
    const data = await this.fetchFromSource(key);
    
    if (this.cache) {
      await this.cache.set(key, data);
    }
    
    return data;
  }
}
```

### Environment-Specific Dependencies

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

class ConfigService {
  getDatabaseConfig(): DatabaseConfig {
    const env = AppSingleton.env();
    
    switch (env) {
      case "production":
        return {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || "5432"),
          database: process.env.DB_NAME
        };
      case "testing":
        return {
          host: "localhost",
          port: 5432,
          database: "test_db"
        };
      default:
        return {
          host: "localhost",
          port: 5432,
          database: "dev_db"
        };
    }
  }
}
```

### Dependency Chains

```typescript
import { RequiresDependency, DependencyLoader } from "ben-shepherd/larascript-core";

class OrderService implements RequiresDependency {
  private database!: DatabaseService;
  private logger!: LoggerService;
  private cache?: CacheService;
  
  setDependencyLoader(loader: DependencyLoader): void {
    this.database = loader<AppContainers, "database">("database");
    this.logger = loader<AppContainers, "logger">("logger");
    this.cache = loader<AppContainers, "cache">("cache");
  }
  
  async createOrder(orderData: OrderData): Promise<Order> {
    this.logger.info("Creating new order", orderData);
    
    // Use database for persistence
    const order = await this.database.create("orders", orderData);
    
    // Use cache for performance
    if (this.cache) {
      await this.cache.set(`order:${order.id}`, order);
    }
    
    this.logger.info("Order created successfully", { orderId: order.id });
    return order;
  }
}
```

## Error Handling

### UninitializedContainerError

The system throws `UninitializedContainerError` when trying to access a container that hasn't been registered:

```typescript
import { AppSingleton, UninitializedContainerError } from "ben-shepherd/larascript-core";

try {
  const service = AppSingleton.container<AppContainers, "unknown">("unknown");
} catch (error) {
  if (error instanceof UninitializedContainerError) {
    console.log(`Container '${error.containerName}' is not initialized`);
  }
}
```

### Safe Error Handling Pattern

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

function getServiceSafely<T extends AppContainers, K extends keyof T>(
  name: K
): T[K] | null {
  try {
    return AppSingleton.container<T, K>(name);
  } catch (error) {
    if (error instanceof UninitializedContainerError) {
      console.warn(`Service '${name}' not available`);
      return null;
    }
    throw error; // Re-throw unexpected errors
  }
}
```

## Best Practices

### 1. Type Safety
Always define proper container types to ensure compile-time type checking:

```typescript
interface AppContainers {
  database: DatabaseService;
  logger: LoggerService;
  cache: CacheService;
  // ... other services
}
```

### 2. Dependency Injection
Use the `RequiresDependency` interface for services that need dependencies:

```typescript
class MyService implements RequiresDependency {
  private logger!: LoggerService;
  
  setDependencyLoader(loader: DependencyLoader): void {
    this.logger = loader<AppContainers, "logger">("logger");
  }
}
```

### 3. Safe Access
Use `safeContainer` or `containerReady` when you're unsure if a container exists:

```typescript
// Instead of this (might throw):
const cache = AppSingleton.container<AppContainers, "cache">("cache");

// Use this (safe):
const cache = AppSingleton.safeContainer<AppContainers, "cache">("cache");
```

### 4. Provider Setup
Always set up dependency injection in providers before binding services:

```typescript
async register(): Promise<void> {
  const service = new MyService();
  service.setDependencyLoader(AppSingleton.container);
  this.bind("myService", service);
}
```

### 5. Environment Awareness
Use the environment information for conditional logic:

```typescript
const env = AppSingleton.env();
if (env === "production") {
  // Production-specific logic
}
```

## Integration with Kernel

The dependency system works seamlessly with the kernel's provider system:

1. **Providers** register services using `AppSingleton.setContainer()`
2. **Services** can implement `RequiresDependency` for dependency injection
3. **Kernel** manages the lifecycle and ensures proper bootstrapping
4. **AppSingleton** provides type-safe access to all registered services

This creates a robust, type-safe dependency injection system that scales with your application's complexity while maintaining clean separation of concerns.

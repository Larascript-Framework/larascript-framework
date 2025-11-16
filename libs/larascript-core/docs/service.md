# Services

The Larascript Core Bundle provides a simple service foundation through the `BaseService` class, enabling type-safe service configuration with full TypeScript support.

## Overview

The `BaseService<Config>` class is the foundation for implementing service patterns. It provides type-safe configuration management for services with a clean, minimal API.

## Key Features

- **Type-safe configuration management** with full TypeScript support
- **Generic configuration type** for compile-time type safety
- **Simple and intuitive API** for configuration operations
- **Null-safe configuration handling**

## Core Components

### BaseService<Config>
The foundation class for implementing service patterns. Provides type-safe configuration management for services.

**Key Methods:**
- `getConfig()` - Retrieve the service configuration
- `constructor(config?)` - Initialize service with optional configuration

**Type Safety:**
- Uses generic type parameter `Config` for configuration type
- Ensures configuration conforms to the specified interface
- Provides compile-time type checking

## Usage Examples

### Basic Implementation

```typescript
import { Service } from "ben-shepherd/larascript-core";

// Define your configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

// Extend BaseService for your database service
class DatabaseService extends Service<DatabaseConfig> {
  constructor(config: DatabaseConfig | null = null) {
    super(config);
  }

  public async connect(): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      throw new Error("Database configuration is required");
    }
    
    // Use configuration to establish connection
    console.log(`Connecting to ${config.host}:${config.port}`);
    return true;
  }

  public getConnectionString(): string {
    const config = this.getConfig();
    if (!config) {
      return "No configuration available";
    }
    
    return `${config.host}:${config.port}`;
  }
}
```

### Service Usage

```typescript
// Create service with configuration
const dbConfig: DatabaseConfig = {
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password"
};

const dbService = new DatabaseService(dbConfig);

// Access configuration
const config = dbService.getConfig();
console.log(config.host); // TypeScript knows this is a string

// Use service methods
await dbService.connect();
console.log(dbService.getConnectionString());
```

### Null Configuration Handling

```typescript
// Create service without configuration
const service = new DatabaseService();

// Check for configuration before use
const config = service.getConfig();
if (config) {
  // Configuration is available
  console.log(config.host);
} else {
  // Handle null configuration
  console.log("No configuration set");
}
```

## Best Practices

1. **Define Clear Interfaces**: Always define TypeScript interfaces for your service configuration to ensure type safety.

2. **Null Safety**: Always check if configuration exists before using it, as it can be null.

3. **Default Values**: Provide sensible defaults in your service methods when configuration is null.

4. **Type Assertions**: Use the generic type parameter to ensure compile-time type checking.

## Integration with Other Components

The `BaseService` class works seamlessly with other Larascript Core Bundle components:

- **With BaseConfig**: Use BaseConfig for more complex configuration management
- **With BaseAdapter**: Combine services with adapter patterns for flexible architectures
- **With Plugins**: Configure service behavior through plugin systems

This service foundation provides a clean, type-safe approach to building services with configuration management capabilities.

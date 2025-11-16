# Configuration Management

The Larascript Core Bundle provides a flexible configuration management system through the `BaseConfig` class, enabling type-safe configuration handling with full TypeScript support.

## Overview

The `BaseConfig` class is the foundation for implementing configuration management patterns. It provides type-safe methods for storing and retrieving configuration data using a composition-based architecture.

## Key Features

- **Type-safe configuration management** with full TypeScript support
- **Composition-based architecture** using mixins
- **Generic type system** for compile-time type safety
- **Simple and intuitive API** for configuration operations

## Core Components

### BaseConfig
The foundation class for implementing configuration management patterns. Provides type-safe methods for storing and retrieving configuration data.

**Key Methods:**
- `getConfig<T>()` - Retrieve configuration with type casting
- `setConfig(config)` - Set the current configuration

**Architecture:**
- Uses composition pattern with `HasConfigConcern` mixin
- Leverages the `compose` utility for clean inheritance

### HasConfigConcern
A mixin that provides configuration management capabilities to any class. Implements the core configuration storage and retrieval logic.

## Usage Examples

### Basic Implementation

```typescript
import { BaseConfig } from "ben-shepherd/larascript-core";

// Define your configuration interface
interface AppConfig {
  apiUrl: string;
  timeout: number;
  features: {
    darkMode: boolean;
    notifications: boolean;
  };
}

// Extend BaseConfig for your application
class AppConfiguration extends BaseConfig {
  constructor() {
    super();
    
    // Set initial configuration
    this.setConfig({
      apiUrl: "https://api.example.com",
      timeout: 5000,
      features: {
        darkMode: false,
        notifications: true
      }
    });
  }

  // Type-safe configuration access
  public getApiConfig(): AppConfig {
    return this.getConfig<AppConfig>();
  }
}
```

### Type-Safe Configuration Access

```typescript
// Create configuration instance
const config = new AppConfiguration();

// Type-safe configuration retrieval
const appConfig = config.getConfig<AppConfig>();
console.log(appConfig.apiUrl); // TypeScript knows this is a string

// Update configuration
config.setConfig({
  ...appConfig,
  features: { ...appConfig.features, darkMode: true }
});
```

## Best Practices

1. **Define Clear Interfaces**: Always define TypeScript interfaces for your configuration to ensure type safety.

2. **Use Generic Types**: Leverage the generic type parameter `T` in `getConfig<T>()` for compile-time type checking.

3. **Immutable Updates**: When updating configuration, create new objects rather than mutating existing ones to prevent side effects.

## Integration with Other Components

The `BaseConfig` class works seamlessly with other Larascript Core Bundle components:

- **With BaseAdapter**: Use configuration to store adapter settings and preferences
- **With Services**: Configure service behavior and connection parameters
- **With Plugins**: Manage plugin-specific configuration data

This configuration system provides a solid foundation for building scalable and maintainable applications with robust configuration management capabilities.

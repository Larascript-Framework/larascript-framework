# Kernel

The Larascript Core Bundle provides a robust application kernel through the `Kernel` class, enabling type-safe application bootstrapping, provider management, and container orchestration with full TypeScript support.

## Overview

The `Kernel<T>` class is the central orchestrator for Larascript applications. It manages the application lifecycle, provider registration and bootstrapping, and provides a container system for dependency injection. The kernel extends `BaseSingleton` to ensure only one instance exists throughout the application lifecycle.

## Key Features

- **Application lifecycle management** with bootstrapping and provider orchestration
- **Type-safe container system** for dependency injection
- **Provider registration and bootstrapping** with exclusion options
- **Environment management** integration with AppSingleton
- **Singleton pattern** ensuring single kernel instance
- **Error handling** for boot state validation

## Core Components

### Kernel<T>
The main kernel class that orchestrates application bootstrapping and manages providers and containers.

**Key Properties:**
- `containers: Map<keyof T, T[keyof T]>` - Type-safe container storage
- `preparedProviders: string[]` - List of providers that have been prepared
- `readyProviders: string[]` - List of providers that are fully booted

**Key Methods:**
- `booted(): boolean` - Check if kernel is fully booted
- `static boot(config, options): Promise<void>` - Bootstrap the kernel
- `static isProviderReady(providerName): boolean` - Check provider readiness

**Type Safety:**
- Uses generic type parameter `T extends Containers`
- Ensures containers conform to specified interface
- Provides compile-time type checking for container access

### KernelConfig
Configuration interface for kernel initialization.

```typescript
interface KernelConfig {
  environment: EnvironmentType;
  providers: IProvider[];
}
```

### KernelOptions
Options for kernel bootstrapping.

```typescript
interface KernelOptions {
  withoutProvider?: string[];
}
```

### Containers
Type definition for kernel containers.

```typescript
type Containers = {
  [key: string]: any;
};
```

## Usage Examples

### Basic Kernel Setup

```typescript
import { Kernel, KernelConfig, KernelOptions } from "ben-shepherd/larascript-core";
import { EnvironmentType } from "ben-shepherd/larascript-core";

// Define your container types
interface AppContainers {
  database: DatabaseService;
  cache: CacheService;
  logger: LoggerService;
}

// Create kernel configuration
const config: KernelConfig = {
  environment: EnvironmentType.PRODUCTION,
  providers: [
    new DatabaseProvider(),
    new CacheProvider(),
    new LoggerProvider()
  ]
};

// Boot options
const options: KernelOptions = {
  withoutProvider: ['LoggerProvider'] // Exclude specific providers
};

// Bootstrap the kernel
await Kernel.boot(config, options);

// Check if kernel is ready
const kernel = Kernel.getInstance<AppContainers>();
if (kernel.booted()) {
  console.log('Application is ready!');
}
```

### Provider Management

```typescript
import { Kernel } from "ben-shepherd/larascript-core";

// Check if specific providers are ready
if (Kernel.isProviderReady('DatabaseProvider')) {
  console.log('Database provider is ready');
}

// Access kernel instance
const kernel = Kernel.getInstance();
console.log('Ready providers:', kernel.readyProviders);
console.log('Prepared providers:', kernel.preparedProviders);
```

## Advanced Usage

### Custom Provider Implementation

```typescript
import { IProvider } from "ben-shepherd/larascript-core";

class CustomProvider implements IProvider {
  async register(): Promise<void> {
    // Register your services, bind dependencies, etc.
    console.log('Custom provider registered');
  }

  async boot(): Promise<void> {
    // Initialize your services, establish connections, etc.
    console.log('Custom provider booted');
  }
}

// Use in kernel configuration
const config: KernelConfig = {
  environment: EnvironmentType.DEVELOPMENT,
  providers: [
    new CustomProvider(),
    // ... other providers
  ]
};
```

### Environment-Specific Configuration

```typescript
import { EnvironmentType } from "ben-shepherd/larascript-core";

const getProviders = (environment: EnvironmentType): IProvider[] => {
  const baseProviders = [
    new LoggerProvider(),
    new DatabaseProvider()
  ];

  switch (environment) {
    case EnvironmentType.DEVELOPMENT:
      return [...baseProviders, new DevToolsProvider()];
    case EnvironmentType.TESTING:
      return [...baseProviders, new MockProvider()];
    case EnvironmentType.PRODUCTION:
      return [...baseProviders, new MonitoringProvider()];
    default:
      return baseProviders;
  }
};

const config: KernelConfig = {
  environment: EnvironmentType.DEVELOPMENT,
  providers: getProviders(EnvironmentType.DEVELOPMENT)
};
```

## Best Practices

### 1. Single Kernel Instance
Always use `Kernel.getInstance()` to access the kernel instance. The kernel is a singleton, ensuring consistent state across your application.

### 2. Provider Ordering
Providers are registered and booted in the order they appear in the configuration. Ensure dependencies are properly ordered.

### 3. Error Handling
Always wrap kernel bootstrapping in try-catch blocks and handle specific error cases appropriately.

### 4. Type Safety
Define proper container types to ensure compile-time type checking and better IDE support.

### 5. Provider Exclusion
Use the `withoutProvider` option for conditional provider loading, especially useful for testing or environment-specific configurations.

### 6. Environment Management
Always set the environment in your kernel configuration to ensure proper application state management.

## Integration with Other Components

### AppSingleton Integration
The kernel automatically sets the application environment in `AppSingleton`, making it available throughout your application:

```typescript
import { AppSingleton } from "ben-shepherd/larascript-core";

// After kernel boot, environment is available
const app = AppSingleton.getInstance();
console.log('Current environment:', app.env);
```

### Provider Pattern
Kernel works seamlessly with the provider pattern, allowing for modular service registration and bootstrapping.

### BaseSingleton Inheritance
Kernel extends `BaseSingleton`, providing consistent configuration management and singleton behavior across the application.

## Troubleshooting

### Common Issues

1. **"Kernel is already booted"**
   - Ensure you're not calling `Kernel.boot()` multiple times
   - Check for multiple kernel initialization in your application

2. **"App environment is not set"**
   - Ensure `environment` is provided in your `KernelConfig`
   - Verify the environment value is valid

3. **Provider not ready**
   - Check if the provider is included in the configuration
   - Verify the provider isn't excluded via `withoutProvider`
   - Ensure the provider's `register()` and `boot()` methods complete successfully

4. **Type errors with containers**
   - Define proper container types in your kernel instance
   - Ensure container keys match your type definition

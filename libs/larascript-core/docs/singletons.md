# Singletons

A singleton ensures that a class has only one instance throughout your application's lifecycle. This is useful for services that need to maintain state or share resources across your application.

## When to Use

- **Shared Resources**: Database connections, configuration managers, logging services
- **State Management**: Caches, session managers, application state
- **Resource-Intensive Operations**: Services that are expensive to instantiate

## Basic Usage

Extend `BaseSingleton` to create your service:

```typescript
import { BaseSingleton } from '@/base/BaseSingleton';

class DatabaseService extends BaseSingleton<{ host: string; port: number }> {
    public connect(): void {
        const config = this.getConfig();
        console.log(`Connecting to ${config?.host}:${config?.port}`);
    }
}
```

## Getting an Instance

Use `getInstance()` to get the singleton instance:

```typescript
// First call creates the instance
const db = DatabaseService.getInstance({ host: 'localhost', port: 5432 });

// Subsequent calls return the same instance
const sameDb = DatabaseService.getInstance();
// sameDb === db (true)
```

## Configuration

Configuration is set on the first `getInstance()` call and ignored on subsequent calls:

```typescript
class ConfigService extends BaseSingleton<{ apiKey: string }> {
    public getApiKey(): string | null {
        return this.getConfig()?.apiKey ?? null;
    }
}

// First call sets the configuration
const config = ConfigService.getInstance({ apiKey: 'abc123' });

// Later calls ignore new configuration
const sameConfig = ConfigService.getInstance({ apiKey: 'different' });
// sameConfig.getApiKey() still returns 'abc123'
```

## Checking Initialization

Check if a service has been initialized:

```typescript
if (!DatabaseService.isInitialized()) {
    DatabaseService.getInstance({ host: 'localhost', port: 5432 });
}
```

## Examples

### Logger Service

```typescript
class LoggerService extends BaseSingleton<{ level: 'debug' | 'info' | 'error' }> {
    public log(message: string): void {
        const level = this.getConfig()?.level ?? 'info';
        console.log(`[${level.toUpperCase()}] ${message}`);
    }
}

// Usage
const logger = LoggerService.getInstance({ level: 'debug' });
logger.log('Application started');
```

### Cache Service

```typescript
class CacheService extends BaseSingleton<{ ttl: number }> {
    private cache = new Map<string, any>();

    public set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    public get(key: string): any {
        return this.cache.get(key);
    }
}

// Usage
const cache = CacheService.getInstance({ ttl: 3600 });
cache.set('user:123', { name: 'John' });
```

### Service Without Configuration

```typescript
class UtilityService extends BaseSingleton {
    public generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

// Usage
const utils = UtilityService.getInstance();
const id = utils.generateId();
```

## Key Points

- Each service class maintains its own singleton instance
- Configuration is only applied on the first `getInstance()` call
- Use `isInitialized()` to check if a service has been created
- Extend `BaseSingleton<ConfigType>` for typed configuration
- Extend `BaseSingleton` (without type) for services without configuration

# Larascript Logger

A Winston-based logging service for the Larascript Framework. Provides structured logging with console and file output, featuring multiple log levels and exception handling.

## Installation

```bash
npm install ben-shepherd/larascript-logger
```

## Quick Start

```typescript
import { LoggerService } from '@ben-shepherd/larascript-logger';

// Initialize logger
const logger = new LoggerService({
  logPath: './logs/app.log'
});

// Bootstrap the logger
logger.boot();

// Start logging
logger.info('Application started');
logger.warn('Deprecated feature used');
logger.error('Something went wrong');
logger.debug('Debug information');
```

## Features

- **Multiple Log Levels**: `info`, `warn`, `error`, `debug`, `verbose`, `help`, `data`
- **Dual Output**: Console and file logging
- **Exception Handling**: Dedicated method for error logging
- **Structured Format**: Timestamped, formatted log entries
- **TypeScript Support**: Full type definitions included

## API Reference

### LoggerService

#### Constructor
```typescript
new LoggerService(config: ILoggerConfig)
```

#### Configuration
```typescript
interface ILoggerConfig {
  logPath: string; // Path to log file
}
```

#### Methods

| Method | Description | Example |
|--------|-------------|---------|
| `boot()` | Initialize the logger | `logger.boot()` |
| `info(...args)` | Log info messages | `logger.info('User logged in', userId)` |
| `warn(...args)` | Log warnings | `logger.warn('API rate limit approaching')` |
| `error(...args)` | Log errors | `logger.error('Database connection failed')` |
| `debug(...args)` | Log debug info | `logger.debug('Request payload:', data)` |
| `verbose(...args)` | Log verbose info | `logger.verbose('Processing step 1/5')` |
| `exception(err)` | Log exceptions | `logger.exception(new Error('Something broke'))` |
| `console(...args)` | Direct console output | `logger.console('Direct output')` |

## Examples

### Basic Usage
```typescript
const logger = new LoggerService({ logPath: './logs/app.log' });
logger.boot();

logger.info('Server starting on port 3000');
logger.warn('SSL certificate expires in 30 days');
logger.error('Failed to connect to database');
```

### Exception Handling
```typescript
try {
  // Some risky operation
  throw new Error('Database connection failed');
} catch (error) {
  logger.exception(error);
}
```

### Debug Logging
```typescript
logger.debug('Request received:', {
  method: 'POST',
  url: '/api/users',
  body: requestBody
});
```

## Log Format

Logs are formatted as:

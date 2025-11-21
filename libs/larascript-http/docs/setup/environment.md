## Http Environment

`HttpEnvironment` is the orchestration layer that boots and wires up the HTTP services for Larascript. Its primary job is to initialize the HTTP server, set up request context, logging, and file uploads, and bridge to framework services like Auth and Database when available.

## Table of contents

- [Summary](#summary)
- [Disable Auth/Database When using outside of Larascript Framework](#disable-authdatabase-when-using-outside-of-larascript-framework)
- [Quick start](#quick-start)
- [Disable Auth/Database (custom security)](#disable-authdatabase-custom-security)
- [Custom logger and uploads directory](#custom-logger-and-uploads-directory)
- [API overview](#api-overview)

### Summary

Creates the HTTP server, sets up request context, logging, and file uploads, and bridges to framework services like Auth and Database when available.

```ts
type IHttpEnvironmentConfig = {
    uploadDirectory: string;
    environment: EnvironmentType;
    databaseConfigured: boolean;
    authConfigured: boolean;
    currentRequestCleanupDelay?: number;
    dependencies?: {
        loggerService?: ILoggerService;
        uploadService?: IHttpUploadService;
    }
}
```

## Disable Auth/Database When using outside of Larascript Framework

When using the Larascript framework outside of its typical environment, you might want to disable the built-in authentication and database services. This can be useful if you plan to implement custom security measures or use external services.

To disable these features, you can configure the `HttpEnvironment` as follows:

```ts
const env = HttpEnvironment.create(httpService, {
  authConfigured: false,  // Disable the built-in authentication
  databaseConfigured: false,  // Disable the built-in database
});

// You can then provide your own authentication middleware for protected routes
await env.boot();
```

By setting `authConfigured` and `databaseConfigured` to `false`, the framework will not attempt to initialize these services. This allows you to integrate your own solutions for authentication and database management.

### Quick start
```ts
import { HttpEnvironment, HttpService, baseConfig } from '@larascript-framework/larascript-http';

const httpService = new HttpService({
    port: 3000,
  ...baseConfig,
});

const env = HttpEnvironment.create(httpService, {
  // optional overrides
  uploadDirectory: process.cwd() + '/storage/uploads',
});

await env.boot();
```

### Disable Auth/Database (custom security)
```ts
const env = HttpEnvironment.create(httpService, {
  authConfigured: false,
  databaseConfigured: false,
});

// Provide your own auth middleware for protected routes
await env.boot();
```

### Custom logger and uploads directory
```ts
import path from 'path';
import { LoggerService } from '@larascript-framework/larascript-logger';

const env = HttpEnvironment.create(httpService, {
  uploadDirectory: path.join(process.cwd(), 'var/uploads'),
  dependencies: {
    loggerService: new LoggerService({ logPath: path.join(process.cwd(), 'var/logs') })
  }
});

await env.boot();
```

### API overview
- `static create(httpService, config?)` — merges defaults, sets the HTTP service, returns the singleton instance.
- `boot()` — initializes request context, logger, uploads, then starts the HTTP server.
- `close()` — stops the HTTP server if running.
- `setPartialConfig(config)` — update configuration at runtime.
- `isAuthConfigured()` / `isDatabaseConfigured()` — feature flag checks.

Convenience getters:
- `authEnvironment`, `authService`
- `databaseEnvironment`, `databaseService`, `queryBuilderService`
- `asyncSession`
- `httpService`, `requestContext`, `uploadService`, `loggerService`

Note: `HttpEnvironment` is a singleton. Repeated calls to `create` return the same instance (updated with provided configuration).



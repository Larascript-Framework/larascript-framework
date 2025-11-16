# Larascript Mail

A flexible and extensible mail service for Larascript applications with support for multiple mail drivers.

## Features

- **Multiple Mail Drivers**: Support for Local, Nodemailer, and Resend
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Easy to add custom mail adapters
- **Template Support**: Built-in support for email templates with locale data
- **Error Handling**: Robust error handling with logging integration
- **Type-Safe Configuration**: Use MailConfig for type-hinted configuration

## Installation

```bash
npm install ben-shepherd/larascript-mail
```

## Quick Start

```typescript
import { 
  MailService, 
  Mail, 
  MailConfig, 
  LocalMailDriver, 
  NodeMailerDriver, 
  ResendMailDriver 
} from '@ben-shepherd/larascript-mail';
import { CreateDependencyLoader } from '@ben-shepherd/larascript-core';
import { ViewService } from '@ben-shepherd/larascript-views';
import { LoggerService } from '@ben-shepherd/larascript-logger';
import path from 'path';

// Configure mail service using MailConfig for type hinting
const mailConfig: IMailConfig = {
    default: process.env.MAIL_DRIVER ?? 'local',
    drivers: MailConfig.drivers([
       /**
        * Add as many drivers as your application requires 
        */
        MailConfig.define({
            name: 'local',
            driver: LocalMailDriver,
            options: {}
        }),
        MailConfig.define({
            name: 'nodemailer',
            driver: NodeMailerDriver,
            options: {
                host: process.env.NODEMAILER_HOST ?? '',
                port: process.env.NODEMAILER_PORT ?? '',
                secure: parseBooleanFromString(process.env.NODEMAILER_SECURE, 'false'), // true for 465, false for other ports
                auth: {
                    user: process.env.NODEMAILER_AUTH_USER ?? '',
                    pass: process.env.NODEMAILER_AUTH_PASS ?? '',
                },
            }
        }),
        MailConfig.define({
            name: 'resend',
            driver: ResendMailDriver,
            options: {
                apiKey: process.env.RESEND_API_KEY
            }
        })
    ])
};

// Create mail service
const mailService = new MailService(mailConfig, {});

// Set up dependencies (required for logging and template rendering)
const view = new ViewService({
    resourcesDir: path.join(process.cwd(), 'src/views')
});

const logger = new LoggerService({
    logPath: path.join(process.cwd(), 'logs/mail.log')
});

mailService.setDependencyLoader(
    CreateDependencyLoader.create({ view, logger })
);

// Boot the service to initialize adapters
mailService.boot();

// Send an email
const mail = new Mail({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello World',
  body: 'This is a test email'
});

await mailService.send(mail);
```

## Dependencies

The MailService requires certain dependencies to function properly:

- **Logger Service**: For error logging and debugging
- **View Service**: For rendering email templates

These dependencies must be set up using a `DependencyLoader` before the service can be used.

### Setting Up Dependencies

```typescript
import { CreateDependencyLoader } from '@ben-shepherd/larascript-core';
import { ViewService } from '@ben-shepherd/larascript-views';
import { LoggerService } from '@ben-shepherd/larascript-logger';

// Create your services
const view = new ViewService({
    resourcesDir: path.join(process.cwd(), 'src/views')
});

const logger = new LoggerService({
    logPath: path.join(process.cwd(), 'logs/mail.log')
});

// Set up the dependency loader
mailService.setDependencyLoader(
    CreateDependencyLoader.create({ view, logger })
);

// Boot the service to initialize adapters
mailService.boot();
```

## Configuration

The `MailConfig` class provides a type-safe way to define your mail configuration. It offers:

- **Type Hinting**: Get autocomplete and type checking for driver options
- **Structured Configuration**: Use `MailConfig.define()` to create driver configurations
- **Environment Variables**: Easily integrate with environment-based configuration

### Driver Configuration

Each driver can be configured using `MailConfig.define()`:

```typescript
MailConfig.define({
    name: 'driver-name',
    driver: YourMailDriver,
    options: {
        // Driver-specific options with type checking
    }
})
```

## Available Drivers

### Local Driver
For development and testing - logs emails to console instead of sending.

### Nodemailer Driver
Uses Nodemailer for SMTP-based email sending.

### Resend Driver
Uses Resend API for reliable email delivery.

## Extending

Need a custom mail driver? See our [extending guide](docs/extending.md) for detailed instructions on creating your own mail adapters.

## API Reference

### MailService
- `setDependencyLoader(loader: DependencyLoader)`: Set the dependency loader for accessing logger and view services
- `boot()`: Initialize mail adapters with dependencies
- `send(mail: IMail, driver?: string)`: Send an email
- `getDefaultDriver()`: Get the default mail driver
- `getDriver<T>(name: string)`: Get a specific mail driver

### Mail
- `setTo(to: string | string[])`: Set recipient(s)
- `setFrom(from: string)`: Set sender
- `setSubject(subject: string)`: Set subject
- `setBody(body: string | object)`: Set email body
- `setOptions(options: object)`: Set driver-specific options

### MailConfig
- `define(config: DriverConfig)`: Define a mail driver configuration
- `drivers(configs: DriverConfig[])`: Create a drivers array with type checking

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint and format
npm run lint
npm run format
```

## License

ISC
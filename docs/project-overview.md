# What is Larascript?

Larascript is a modern, type-safe Node.js framework designed for building scalable applications with a focus on developer experience. It provides a comprehensive ecosystem of modular packages that can be used independently or together to create robust, maintainable applications.

## 🏗️ Architecture Overview

### Monorepo Structure
```
larascript-monorepo/
├── apps/
│   └── larascript-framework/     # Main framework application
├── libs/                         # Shared libraries and packages
│   ├── larascript-core/         # Core framework components
│   ├── larascript-acl/          # Access control system
│   ├── larascript-validator/    # Validation system
│   └── ...                      # Other specialized packages
└── docs/                        # Documentation
```

### Package Categories

#### 🎯 Core Framework Packages
These packages form the foundation of the Larascript ecosystem:

- **`@larascript-framework/larascript-core`** - Core components, base classes, and foundational patterns
- **`@larascript-framework/larascript-acl`** - Access Control List system for authorization
- **`@larascript-framework/larascript-validator`** - Comprehensive validation system
- **`@larascript-framework/larascript-logger`** - Structured logging with multiple transports
- **`@larascript-framework/larascript-observer`** - Event-driven architecture patterns
- **`@larascript-framework/larascript-views`** - Template rendering and view management
- **`@larascript-framework/larascript-collection`** - Collection utilities and data structures
- **`@larascript-framework/larascript-utils`** - Common utility functions and helpers

#### 🔧 Utility Packages
Standalone utilities that can be used in any Node.js project:

- **`@larascript-framework/async-session`** - Asynchronous session management
- **`@larascript-framework/cast-js`** - Type casting and transformation utilities
- **`@larascript-framework/crypto-js`** - Cryptographic operations and security utilities
- **`@larascript-framework/dot-notation-extractor`** - Dot notation data extraction and manipulation
- **`@larascript-framework/larascript-mail`** - Email functionality with multiple providers

#### 🛠️ Development Tools
Shared configurations and development utilities:

- **`@larascript-framework/eslint-config`** - Standardized ESLint configuration
- **`@larascript-framework/tsconfig`** - Shared TypeScript configuration
- **`@larascript-framework/jest-config`** - Jest testing configuration
- **`@larascript-framework/check-exports`** - Export validation utilities

## 🚀 Key Features

### Framework Features
- **Full-Stack Capabilities**: Web framework with built-in ORM, templating, and API support
- **Database Integration**: Support for PostgreSQL, MongoDB, and other databases
- **Authentication & Authorization**: JWT-based auth with flexible ACL system
- **Email System**: Multi-provider email support (Nodemailer, Resend)
- **File Uploads**: Built-in file handling with cloud storage support
- **API Development**: RESTful API development with automatic documentation
- **Template Engine**: EJS templating with layouts and partials

### Development Features
- **Hot Reloading**: Development server with automatic reloading
- **Type Safety**: Full TypeScript support with strict configuration
- **Testing**: Comprehensive testing setup with Jest
- **Code Quality**: ESLint, Prettier, and automated code formatting
- **Docker Support**: Containerized development and deployment
- **Monorepo Management**: Turbo-powered build system with caching

### Production Features
- **Logging**: Structured logging with multiple transports
- **Monitoring**: Built-in health checks and monitoring endpoints
- **Security**: CSRF protection, rate limiting, and security headers
- **Performance**: Optimized builds and runtime performance
- **Deployment**: Docker-based deployment with environment configuration

## 🎯 Use Cases

### Web Applications
Build full-stack web applications with server-side rendering, API endpoints, and modern frontend integration.

### API Services
Create robust REST APIs with automatic documentation, validation, and authentication.

### Microservices
Use individual packages to build microservices with shared utilities and consistent patterns.

### Enterprise Applications
Scale from small applications to large enterprise systems with built-in security, monitoring, and maintainability features.

## 🔄 Technology Stack

### Runtime & Language
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript

### Package Management & Build
- **pnpm** - Fast, disk space efficient package manager
- **Turbo** - High-performance build system for JavaScript and TypeScript codebases

### Databases & ORM
- **PostgreSQL** - Primary relational database
- **MongoDB** - NoSQL database support

### Web Framework & Middleware
- **Express.js** - Web application framework
- **EJS** - Template engine
- **CORS** - Cross-origin resource sharing
- **JWT** - JSON Web Tokens for authentication

### Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

### Cloud & Services
- **AWS SDK** - Cloud services integration
- **Nodemailer** - Email functionality
- **Resend** - Modern email API

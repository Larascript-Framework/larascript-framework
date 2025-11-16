# Quick Start Guide

Get up and running with Larascript in minutes! This guide will help you set up your development environment and create your first application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **pnpm** (v10.0.0 or higher)
- **Docker** (for database services)
- **Git**
- **Turbo Repo** ([turborepo.com/docs](https://turborepo.com/docs))


## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Larascript-Framework/larascript-framework.git
cd larascript-framework
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Build All Packages
```bash
pnpm build
```

## Database Setup

### Start Database Services
```bash
# Start PostgreSQL and MongoDB
pnpm db:up

# Or start them individually
pnpm db:postgres:up
pnpm db:mongodb:up
```

### Run Setup Command

```bash
cd apps/larascript-framework
pnpm run setup
```

The setup command will ask you a few questions to configure the framework.

### Verify Database Connection
The databases will be available at:
- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`

## Running the Framework

### Development Mode
```bash
# Start the framework in development mode
cd apps/larascript-framework
pnpm run dev

# The application will be available at http://localhost:3000
```

### Production Mode
```bash
# Build and start in production mode
pnpm build
pnpm start
```

## Testing

### Run All Tests
```bash
turbo run test --concurrency=100%
```

### Run Tests for Specific Package
```bash
turbo run test --concurrency=1 --filter="./libs/*database"
```

### Run Tests with Coverage
```bash
cd apps/larascript-framework
pnpm run test:coverage
```

## Development

### Code Quality
```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck
```

### Building
```bash
# Build all packages
turbo build --concurrency=100%


# Build specific package
turbo build --filter="./libs/*database" --concurrency=25
```

### Watching for Changes
```bash
# Watch mode for development
pnpm build:watch
```
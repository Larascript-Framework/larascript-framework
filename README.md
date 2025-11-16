# Larascript Framework

A comprehensive monorepo containing the Larascript Framework and its ecosystem of packages, providing a powerful Node.js framework with built-in ORM, type safety, and developer-friendly APIs.

## In Development

This is a work in progress and is not yet ready for production.

## 🚀 Overview

Larascript is a modern, type-safe Node.js framework designed for building scalable applications with a focus on developer experience. This monorepo contains the main framework application and a collection of modular packages that can be used independently or together.


## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Build Tool**: Turbo (monorepo orchestration)
- **Testing**: Jest
- **Linting**: ESLint
- **Database**: PostgreSQL, MongoDB
- **ORM**: Utilizes Sequelize for initial schema setup, complemented by Larascript's custom schema system
- **Web Framework**: Express.js
- **Template Engine**: EJS
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer, Resend
- **Cloud**: AWS SDK

## 📋 Prerequisites

- Node.js (v16 or higher)
- pnpm (v10.0.0 or higher)
- Docker (for database services)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd larascript-monorepo

# Install dependencies
pnpm install
```

### Setting Up Git Remote (Optional)

Make sure your own repository is setup instead of the original - update the git remote:

```bash
# Remove the original remote
git remote remove origin

# Add your own repository as the new remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Or if using SSH
git remote add origin git@github.com:yourusername/your-repo-name.git

# Verify the new remote
git remote -v

# Push to your repository (if you want to keep the history)
git push -u origin main
```

### Framework Setup

```bash
# Add write permissions to logs directory
chmod -R 755 apps/larascript-framework/storage

# Start PostgreSQL and MongoDB
pnpm db:up

# Run setup command (optional - populates .env with configured settings)
pnpm setup

# Run database migrations
pnpm dev migrate:up

# Start development environment
pnpm dev
```

### Development

```bash
# Start development environment
pnpm dev

# Run tests across all packages
pnpm test

# Build all packages
pnpm build

# Lint all packages
pnpm lint
```

### Database Setup

```bash
# Start PostgreSQL and MongoDB
pnpm db:up

# Stop databases
pnpm db:down

# Restart databases
pnpm db:restart
```

### API Development

```bash
# Start API with Docker
pnpm api:up

# Stop API
pnpm api:down

# Access API container shell
pnpm api:sh
```

## 📁 Project Structure

```
larascript-monorepo/
├── app/
│   └── larascript-framework/     # Main framework application
├── libs/                        # Core framework libraries
│   ├── larascript-core/         # Core framework components
│   ├── larascript-acl/          # Access control system
│   ├── larascript-collection/   # Collection utilities
│   └── ...                      # Other libraries
├── packages/                    # Your own packages
│   └── ...                      # Add your custom packages here
├── docs/                        # Documentation
├── package.json                 # Root package configuration
├── pnpm-workspace.yaml         # Workspace configuration
└── turbo.json                  # Build orchestration
```

## 🧪 Testing

Each package includes comprehensive test suites:

```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
cd packages/larascript-core
pnpm test

# Run tests with coverage
pnpm test:coverage
```

##  Development Scripts

### Root Level Commands
- `pnpm dev` - Start development environment
- `pnpm build` - Build all packages
- `pnpm build:watch` - Build all packages in watch mode
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm check` - Type checking across all packages

### Framework Application Commands
- `pnpm start` - Start the framework application
- `pnpm dev` - Start development server with hot reload
- `pnpm dev:tinker` - Run the tinker playground script for testing and experimenting with code (`src/tinker.ts`)
- `pnpm setup` - Run setup scripts
- `pnpm db:up` - Start database services
- `pnpm api:up` - Start API with Docker

## 📚 Documentation

- **Framework Documentation**: See `docs/` for main docs
- **Package Documentation**: Each package contains its own README and documentation
- **API Documentation**: Available when running the framework application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow the existing code style and patterns
4. Add comprehensive tests for new features
5. Update documentation as needed
6. Ensure all tests pass before submitting
7. Follow conventional commit message format

### Branch Naming Convention
Branches must follow the pattern: `^(feat|fix|hotfix|release|test|experimental|refactor)/.+$`

Example: `feat/example`

## 📄 License

ISC License - see individual package.json files for details.

## 👨‍💻 Author

**Ben Shepherd** - ben.shepherd@gmx.com

- LinkedIn: [Benjamin Shepherd](https://www.linkedin.com/in/benjamin-programmer/)

---

**Note**: This is a monorepo managed with pnpm workspaces and Turbo. Each package can be used independently or as part of the larger Larascript ecosystem.

# Development Setup

This guide provides a complete setup for developing with the Larascript monorepo, including environment configuration, tooling setup, and development workflow.

## 🛠️ Prerequisites

### Required Software

#### Node.js
- **Version**: 16.x or higher
- **Installation**: Download from [nodejs.org](https://nodejs.org/)
- **Verification**: `node --version && npm --version`

#### pnpm
- **Version**: 10.0.0 or higher
- **Installation**: `npm install -g pnpm@10.0.0`
- **Verification**: `pnpm --version`

#### Docker
- **Purpose**: Database services and containerized development
- **Installation**: Download from [docker.com](https://docker.com/)
- **Verification**: `docker --version && docker-compose --version`

#### Git
- **Purpose**: Version control
- **Installation**: Download from [git-scm.com](https://git-scm.com/)
- **Verification**: `git --version`

### Optional Tools

#### VS Code
- **Purpose**: Recommended IDE with excellent TypeScript support
- **Installation**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
- **Extensions**: TypeScript, ESLint, Prettier, Docker

#### Postman/Insomnia
- **Purpose**: API testing and development
- **Installation**: Download from respective websites

## 🚀 Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ben-shepherd/larascript-monorepo.git
cd larascript-monorepo
```

### 2. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

### 3. Environment Configuration

#### Create Environment Files
```bash
# Copy example environment files
cp apps/larascript-framework/.env.example apps/larascript-framework/.env
```

#### Configure Environment Variables
```env
# apps/larascript-framework/.env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=larascript_dev
DB_USER=postgres
DB_PASSWORD=password

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/larascript_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Email Configuration
MAIL_DRIVER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null

# AWS Configuration (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Logging Configuration
LOG_LEVEL=debug
LOG_TRANSPORTS=console,file
```

### 4. Database Setup

#### Start Database Services
```bash
# Start PostgreSQL and MongoDB
pnpm db:up

# Verify services are running
docker ps
```

#### Database Connection Test
```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d larascript_dev

# Test MongoDB connection
mongosh mongodb://localhost:27017/larascript_dev
```

### 5. Build the Project
```bash
# Build all packages
pnpm build

# Verify build
ls -la libs/*/dist/
```

## 🔧 Development Tools Setup

### VS Code Configuration

#### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "apps/larascript-framework",
    "libs/*"
  ],
  "typescript.suggest.autoImports": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  }
}
```

#### Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Larascript Framework",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/larascript-framework/src/app.ts",
      "runtimeArgs": [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register"
      ],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

#### Extensions Configuration
Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest"
  ]
}
```

### Git Configuration

#### Git Hooks
```bash
# Install lefthook for git hooks
pnpm add -D lefthook

# Initialize lefthook
npx lefthook install
```

#### Git Ignore
Ensure `.gitignore` includes:
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Turbo
.turbo
```

## 🏃‍♂️ Development Workflow

### Daily Development Commands

#### Start Development Environment
```bash
# Start databases
pnpm db:up

# Start development server
pnpm dev

# In another terminal, watch for changes
pnpm build:watch
```

#### Code Quality Checks
```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Run all checks
pnpm check
```

#### Testing
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
cd libs/larascript-core && pnpm test
```

### Package Development

#### Creating a New Package
```bash
# Use the template
cp -r libs/larascript-forkable-bundle libs/my-new-package
cd libs/my-new-package

# Update package.json
{
  "name": "@larascript-framework/my-new-package",
  "version": "1.0.0",
  "description": "Your package description"
}

# Install dependencies
pnpm install

# Build the package
pnpm build

# Test the package
pnpm test
```

#### Working with Existing Packages
```bash
# Navigate to package
cd libs/larascript-core

# Install dependencies
pnpm install

# Build package
pnpm build

# Test package
pnpm test

# Watch for changes
pnpm build:watch
```

### Database Development

#### Database Migrations
```bash
# Run migrations
pnpm setup

# Reset database
pnpm db:restart
pnpm setup
```

#### Database Seeding
```bash
# Run seeders
pnpm seed

# Run specific seeder
pnpm seed:users
```

### API Development

#### Start API with Docker
```bash
# Start API container
pnpm api:up

# View logs
docker logs -f larascript-api

# Access container shell
pnpm api:sh

# Stop API
pnpm api:down
```

#### API Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users
```

## 🔍 Debugging

### Application Debugging

#### Debug Mode
```bash
# Start with debugging
NODE_ENV=development DEBUG=* pnpm dev

# Debug specific modules
DEBUG=larascript:* pnpm dev
```

#### VS Code Debugging
1. Set breakpoints in your code
2. Press F5 or use the Debug panel
3. Select "Debug Larascript Framework"
4. The debugger will stop at breakpoints

### Package Debugging

#### Debug Specific Package
```bash
# Navigate to package
cd libs/larascript-core

# Start debugging
NODE_ENV=development DEBUG=* pnpm dev
```

#### Test Debugging
```bash
# Debug tests
NODE_ENV=test DEBUG=* pnpm test

# Debug specific test file
NODE_ENV=test DEBUG=* pnpm test -- --testNamePattern="UserService"
```

### Database Debugging

#### PostgreSQL Debugging
```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d larascript_dev

# View logs
docker logs larascript-postgres
```

#### MongoDB Debugging
```bash
# Connect to database
mongosh mongodb://localhost:27017/larascript_dev

# View logs
docker logs larascript-mongodb
```

## 🧪 Testing Setup

### Test Configuration

#### Jest Configuration
Each package has its own Jest configuration extending the base config:

```javascript
// libs/larascript-core/jest.config.js
const baseConfig = require('@larascript-framework/jest-config/jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'larascript-core',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ]
};
```

#### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

### Running Tests

#### All Tests
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

#### Specific Tests
```bash
# Run tests for specific package
cd libs/larascript-core && pnpm test

# Run specific test file
pnpm test -- --testPathPattern="UserService.test.ts"

# Run tests matching pattern
pnpm test -- --testNamePattern="should create user"
```

#### Test Coverage
```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## 📦 Build System

### Turbo Configuration

#### Build Pipeline
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

#### Build Commands
```bash
# Build all packages
pnpm build

# Build specific package
cd libs/larascript-core && pnpm build

# Build in watch mode
pnpm build:watch

# Clean build
pnpm clean && pnpm build
```

### TypeScript Configuration

#### Base Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Package Configuration
Each package extends the base configuration:

```json
{
  "extends": "@larascript-framework/tsconfig/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check if databases are running
docker ps

# Restart databases
pnpm db:restart

# Check database logs
docker logs larascript-postgres
docker logs larascript-mongodb
```

#### Build Issues
```bash
# Clean and rebuild
rm -rf node_modules
rm -rf libs/*/dist
pnpm install
pnpm build
```

#### TypeScript Issues
```bash
# Clear TypeScript cache
rm -rf .turbo
pnpm typecheck

# Rebuild TypeScript
pnpm build
```

### Performance Optimization

#### Turbo Cache
```bash
# Clear Turbo cache
pnpm turbo clean

# Rebuild with cache
pnpm build
```

#### Dependency Optimization
```bash
# Check for unused dependencies
pnpm depcheck

# Update dependencies
pnpm update
```

## 📚 Additional Resources

### Documentation
- [Project Overview](./project-overview.md)
- [Architecture Guide](./architecture.md)
- [Package Development](./package-development.md)
- [Testing Guide](./testing.md)

### External Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Turbo Documentation](https://turbo.build/repo/docs)

---

**Next Steps**: [Package Development](./package-development.md) → [Testing Guide](./testing.md) → [Build System](./build-system.md)

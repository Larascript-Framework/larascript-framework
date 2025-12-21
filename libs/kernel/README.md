# Larascript Package Template

This is a template for creating new packages within the Larascript monorepo. Follow the steps below to create your own package.

## Creating a New Package

### 1. Copy the Template Directory

Copy the template directory to create your new package:

```bash
# From the monorepo root
cp -r libs/template libs/your-package-name

# Example:
cp -r libs/template libs/larascript-my-feature
```

### 2. Rename and Update Package Configuration

Navigate to your new package directory and update the configuration:

```bash
cd libs/your-package-name
```

#### Update package.json

Edit the `package.json` file and update the following fields:

```json
{
  "name": "@larascript-framework/your-package-name",
  "description": "Your package description here",
  "version": "0.1.0"
}
```

**Required changes:**
- `name`: Change from "PLACEHOLDER" to your package name (e.g., "@larascript-framework/larascript-my-feature")
- `description`: Replace "PLACEHOLDER DESCRIPTION" with a meaningful description
- `version`: Set to "0.1.0" for new packages

#### Update README.md

Replace the template README content with documentation specific to your package:
- What the package does
- How to install and use it
- Examples and API documentation
- Contributing guidelines

### 3. Add Package to Turbo Pipeline

If your package has build/test/lint scripts, add it to the root `turbo.json` pipeline:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### 4. Initialize Your Package

```bash
# From the monorepo root, install dependencies
pnpm install --ignore-scripts

# Run tests to ensure everything works
pnpm test

# Build the project
pnpm build
```

### 5. Customize Your Package

- Add your package-specific code to `src/index.ts`
- Update tests in the `src/tests/` directory
- Modify configuration files as needed (they already extend from the base configs)

## Important Notes

### Export Guidelines

**Default Exports**: All exports should be named exports.

**Index Files**: Create an `index.ts` file in every directory you create and export all files from that directory.

**Example Structure:**
```
src/
├── index.ts                 # Main entry point
├── components/
│   ├── index.ts            # Export all components
│   ├── Button.ts
│   └── Modal.ts
├── utils/
│   ├── index.ts            # Export all utilities
│   ├── helpers.ts
│   └── validators.ts
└── types/
    ├── index.ts            # Export all types
    └── common.ts
```

**Example index.ts files:**

```typescript
// src/components/index.ts
export * from './Button';
export * from './Modal';

// src/utils/index.ts
export * from './helpers';
export * from './validators';

// src/types/index.ts
export * from './common';

// src/index.ts (main entry)
export * from './components';
export * from './utils';
export * from './types';
```

### Configuration Inheritance

This template is already configured to:
- Extend `@larascript-framework/tsconfig` in `tsconfig.json`
- Import and export `@larascript-framework/eslint-config` in `eslint.config.js`
- Use `@larascript-framework/jest-config` in `jest.config.js`

No additional configuration is needed unless you have package-specific requirements.

## Development Workflow

This template includes several helpful scripts:

- `pnpm build` - Build the TypeScript code
- `pnpm dev` - Run the TypeScript code in development mode
- `pnpm test` - Run tests
- `pnpm lint` - Check code style
- `pnpm lint:fix` - Fix code style issues
- `pnpm format` - Format code with Prettier

### Setting up Lefthook (optional)

This project uses Lefthook for pre-commit hooks. To set it up:

```bash
# Install lefthook locally (recommended)
npx lefthook install

# If the above doesn't work, install lefthook globally and try again
npm install -g lefthook
lefthook install
```

Lefthook will automatically run linting, formatting, and tests before each commit to ensure code quality.

## Publishing

When ready to publish:

1. Update the version in `package.json`
2. Commit your changes
3. Create a git tag for the version
4. Push to the repository
5. The package will be published to the npm registry

## Template Features

- TypeScript configuration (extends base config)
- Jest testing setup (extends base config)
- ESLint and Prettier for code quality (extends base config)
- Commit message linting with conventional commits
- GitHub Actions ready
- Branch name validation
- Pre-commit hooks with Lefthook
- Monorepo workspace integration

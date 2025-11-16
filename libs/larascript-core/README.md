# Larascript Core Bundle

A collection of core components for the Larascript Framework, providing a robust foundation for building type-safe, extensible applications with modular architecture patterns.

## Overview

The Larascript Core Bundle is a TypeScript package that provides essential building blocks for creating type-safe, extensible services and applications. It includes foundational patterns and utilities that can be used across different domains, from adapter patterns to service management and beyond. The package is designed to be modular and extensible, making it suitable for a wide range of use cases including but not limited to service providers, storage systems, authentication mechanisms, and more.


### 🛠️ Development Tools
- **TypeScript** - Full type safety and modern JavaScript features
- **Jest** - Comprehensive testing framework
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Lefthook** - Git hooks for quality assurance
- **Commitlint** - Conventional commit message validation


## Documentation

- **[Kernel](./docs/kernel.md)** - Detailed documentation on the application kernel, provider management, bootstrapping, and advanced usage

- **[Dependency](./docs/dependency.md)** - Full guide to the dependency injection system, AppSingleton, DependencyLoader, and best practices


- **[Adapters](./docs/adapters.md)** - Comprehensive guide to the BaseAdapter pattern, usage examples, 
and best practices

- **[Config](./docs/config.md)** - Learn how to manage and use configuration objects in your services

- **[Singletons](./docs/singletons.md)** - Guide to the BaseSingleton pattern, usage, and advanced examples

- **[Services](./docs/service.md)** - Learn about the BaseService class, type-safe service configuration, and service usage patterns

## Installation

```bash
npm install ben-shepherd/larascript-core
```

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd larascript-core

# Install dependencies
npm install

# Install git hooks (optional but recommended for development)
lefthook install
```

### Available Scripts

```bash
# Build the project
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Code quality
npm run lint
npm run lint:fix
npm run typecheck
npm run format
```

### Git Hooks
The project uses Lefthook for git hooks that automatically:
- Validate commit messages follow conventional format
- Run linting and type checking on staged files
- Ensure code quality standards are maintained

**Note:** Git hooks are only needed for development. When installing this package as a dependency, you can skip the `lefthook install` step.

## Testing

The package includes comprehensive test coverage demonstrating:
- Component registration and retrieval
- Error handling for duplicate and missing components
- Type safety validation
- Integration testing with mock components

Run tests with:
```bash
npm test
```

## Contributing

When contributing to this project:
1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting
5. Follow conventional commit message format

### Branch Naming Convention
Branches must follow the pattern: `^(feat|fix|hotfix|release|test|experimental|refactor)/.+$`

Example: feat/example

## License

ISC License - see package.json for details.

## Author

Ben Shepherd - ben.shepherd@gmx.com

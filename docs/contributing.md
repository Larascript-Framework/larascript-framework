# Contributing Guidelines

Thank you for your interest in contributing to the Larascript monorepo! This guide will help you get started with contributing to the project.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Report bugs and issues
- **Feature Requests**: Suggest new features and improvements
- **Code Contributions**: Submit pull requests with code changes
- **Documentation**: Improve or add documentation
- **Testing**: Write or improve tests
- **Code Review**: Review pull requests from other contributors

## 🚀 Getting Started

### 1. Fork the Repository

1. Go to [larascript-monorepo](https://github.com/ben-shepherd/larascript-monorepo)
2. Click the "Fork" button in the top right
3. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/larascript-monorepo.git
   cd larascript-monorepo
   ```

### 2. Set Up Development Environment

Follow the [Development Setup Guide](./development-setup.md) to configure your local environment.

### 3. Create a Branch

Create a feature branch following our naming convention:

```bash
# Branch naming pattern: type/description
git checkout -b feat/user-authentication
git checkout -b fix/database-connection-issue
git checkout -b docs/api-documentation-update
```

**Branch Types:**
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions or improvements
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `chore/` - Maintenance tasks

## 📝 Development Workflow

### 1. Make Your Changes

- Follow the [Code Style Guide](./code-style.md)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 2. Commit Your Changes

Use conventional commit messages:

```bash
# Format: type(scope): description
git commit -m "feat(auth): add JWT token validation"
git commit -m "fix(core): resolve memory leak in service container"
git commit -m "docs(api): update authentication endpoints documentation"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test additions or changes
- `chore` - Maintenance tasks

### 3. Push Your Changes

```bash
git push origin feat/your-feature-name
```

### 4. Create a Pull Request

1. Go to your forked repository on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the pull request template
5. Submit the pull request

## 📋 Pull Request Guidelines

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation has been updated
- [ ] Changes generate no new warnings
- [ ] Tests have been added for new functionality

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: All PRs must pass automated checks
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests (Jest)
   - Build verification

2. **Code Review**: At least one maintainer must approve
   - Code quality review
   - Architecture review
   - Security review

3. **Merge**: Once approved, the PR will be merged

## 🧪 Testing Guidelines

### Writing Tests

#### Unit Tests
```typescript
// tests/unit/UserService.test.ts
import { UserService } from '../../src/services/UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = await userService.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(userService.create(userData))
        .rejects
        .toThrow('Invalid email format');
    });
  });
});
```

#### Integration Tests
```typescript
// tests/integration/UserController.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('UserController Integration', () => {
  describe('POST /api/users', () => {
    it('should create user and return 201', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd libs/larascript-core && pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📚 Documentation Guidelines

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * User service for managing user operations
 */
export class UserService {
  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Promise<User> - Created user
   * @throws {ValidationException} When user data is invalid
   * @throws {DuplicateEmailException} When email already exists
   */
  async create(userData: CreateUserData): Promise<User> {
    // Implementation
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns Promise<User | null> - Found user or null
   */
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

#### README Files
Each package should have a comprehensive README:

```markdown
# Package Name

Brief description of the package.

## Installation

```bash
pnpm add @larascript-framework/package-name
```

## Usage

```typescript
import { PackageClass } from '@larascript-framework/package-name';

const instance = new PackageClass();
```

## API Reference

### Class: PackageClass

#### Methods

##### `methodName(param: string): Promise<Result>`

Description of the method.

**Parameters:**
- `param` (string): Description of parameter

**Returns:**
- `Promise<Result>`: Description of return value

**Example:**
```typescript
const result = await instance.methodName('example');
```

## Contributing

See [Contributing Guidelines](../../docs/contributing.md)
```

## 🔧 Code Style Guidelines

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use types for unions and complex types
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};
```

#### Error Handling
```typescript
// Use custom exceptions
import { ValidationException, NotFoundException } from '@larascript-framework/larascript-core';

async function validateUser(data: any): Promise<void> {
  if (!data.email) {
    throw new ValidationException('Email is required');
  }
  
  if (!isValidEmail(data.email)) {
    throw new ValidationException('Invalid email format');
  }
}

async function findUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  
  return user;
}
```

#### Async/Await
```typescript
// Prefer async/await over promises
async function processUsers(): Promise<User[]> {
  try {
    const users = await userRepository.findAll();
    return users.filter(user => user.active);
  } catch (error) {
    logger.error('Failed to process users', { error });
    throw error;
  }
}
```

### Naming Conventions

#### Files and Directories
- Use kebab-case for file and directory names
- Use PascalCase for class names
- Use camelCase for function and variable names
- Use UPPER_SNAKE_CASE for constants

```typescript
// File: user-service.ts
export class UserService {
  private readonly userRepository: IUserRepository;
  
  async createUser(userData: CreateUserData): Promise<User> {
    // Implementation
  }
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
```

#### Database and API
- Use snake_case for database columns and API endpoints
- Use camelCase for JavaScript/TypeScript properties

```typescript
// Database column: created_at
// TypeScript property: createdAt
interface User {
  id: string;
  firstName: string; // Maps to first_name in DB
  lastName: string;  // Maps to last_name in DB
  createdAt: Date;   // Maps to created_at in DB
}

// API endpoint: /api/users
// Route handler: getUsers
```

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Node.js Version: [e.g. 16.15.0]
- pnpm Version: [e.g. 10.0.0]
- Browser: [e.g. Chrome, Safari] (if applicable)

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe the solution you'd like to see.

## Alternative Solutions
Describe any alternative solutions you've considered.

## Additional Context
Add any other context or screenshots about the feature request.
```

## 🔒 Security

### Security Guidelines

- Never commit sensitive information (API keys, passwords, etc.)
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices
- Report security vulnerabilities privately

### Reporting Security Issues

If you discover a security vulnerability, please report it privately:

1. **Email**: ben.shepherd@gmx.com
2. **Subject**: [SECURITY] Larascript Vulnerability Report
3. **Include**: Detailed description of the vulnerability

## 🏷️ Release Process

### Version Management

We use semantic versioning (SemVer):

- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes, backward compatible

### Release Checklist

Before a release:

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] Changelog is updated
- [ ] Version numbers are updated
- [ ] Release notes are prepared

## 🎯 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: ben.shepherd@gmx.com

### Resources

- [Development Setup](./development-setup.md)
- [Code Style Guide](./code-style.md)
- [Testing Guide](./testing.md)
- [Architecture Guide](./architecture.md)

## 🙏 Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes
- Project documentation
- Community acknowledgments

---

Thank you for contributing to Larascript! Your contributions help make this project better for everyone.

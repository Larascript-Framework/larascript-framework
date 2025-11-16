# Larascript Auth

A comprehensive authentication package for the Larascript Framework, providing JWT authentication, user management, API token handling, and ACL integration.

## Features

- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **User Management**: User model with repository pattern for flexible data storage
- **API Token Support**: Single-use and reusable API tokens with scope-based permissions
- **ACL Integration**: Built-in integration with Larascript ACL for role-based access control
- **One-Time Authentication**: Secure single-use token generation for temporary access
- **Extensible Architecture**: Adapter-based design for easy customization and extension

## Installation

```bash
npm install @larascript-framework/larascript-auth
```

## Quick Start

### Basic Setup

```typescript
import { AuthService, AuthConfig } from '@larascript-framework/larascript-auth';
import { TestUserFactory, TestApiTokenFactory } from './tests/factory';
import { InMemoryUserRepository, InMemoryApiTokenRepository } from './tests/repository';

// Configure authentication
const authConfig: AuthConfig = {
  drivers: {
    jwt: {
      name: 'jwt',
      options: {
        secret: 'your-jwt-secret',
        expiresInMinutes: 60,
        factory: {
          user: TestUserFactory,
          apiToken: TestApiTokenFactory
        },
        repository: {
          user: InMemoryUserRepository,
          apiToken: InMemoryApiTokenRepository
        }
      }
    }
  }
};

// Initialize auth service
const authService = new AuthService(authConfig, aclConfig);
await authService.boot();
```

### User Authentication

```typescript
import { AsyncSessionService } from '@larascript-framework/async-session';

// Get JWT service
const jwtService = authService.getJwt();

// Set up async session service
const asyncSession = new AsyncSessionService();
jwtService.setAsyncSession(asyncSession);

// Login with credentials (returns JWT token)
const token = await jwtService.attemptCredentials('user@example.com', 'password');

// Authenticate with token (returns API token)
const apiToken = await jwtService.attemptAuthenticateToken(token);

// Authorize user within async session context
await asyncSession.runWithSession(async () => {
  // Authorize user in current session
  jwtService.authorizeUser(user, ['user:read', 'user:write']);
  
  // Check authentication status
  const isAuthenticated = await jwtService.check();
  const currentUser = await jwtService.user();
  
  // Logout user
  jwtService.logout();
});
```

**Important**: The `authorizeUser()`, `check()`, and `logout()` methods only work within an async session context. The session maintains the current user's authentication state across async operations.

### One-Time Token Authentication

```typescript
import { OneTimeAuthenticationService } from '@larascript-framework/larascript-auth';

const oneTimeService = new OneTimeAuthenticationService();
oneTimeService.setAuthService(authService);

// Create single-use token
const token = await oneTimeService.createSingleUseToken(user);

// Validate token
const apiToken = await jwtService.attemptAuthenticateToken(token);
const isValid = oneTimeService.validateSingleUseToken(apiToken);
```

## Core Components

### AuthService

The main authentication service that orchestrates all authentication operations:

```typescript
interface IAuthService {
  boot(): Promise<void>;
  check(): Promise<boolean>;
  user(): Promise<IUserModel | null>;
  getJwt(): IJwtAuthService;
  acl(): IBasicACLService;
  getUserRepository(): IUserRepository;
  getApiTokenRepository(): IApiTokenRepository;
}
```

### JWT Authentication Service

Handles JWT token generation, validation, and user authentication:

```typescript
interface IJwtAuthService {
  attemptCredentials(email: string, password: string, scopes?: string[], options?: ApiTokenModelOptions): Promise<string>;
  attemptAuthenticateToken(token: string): Promise<IApiTokenModel | null>;
  refreshToken(apiToken: IApiTokenModel): string;
  revokeToken(apiToken: IApiTokenModel): Promise<void>;
  revokeAllTokens(userId: string | number): Promise<void>;
  logout(): void;
  check(): Promise<boolean>;
  user(): Promise<IUserModel | null>;
  hashPassword(password: string): Promise<string>;
  getUserRepository(): IUserRepository;
  getApiTokenRepository(): IApiTokenRepository;
  getUserFactory(): IUserFactory;
  getApiTokenFactory(): IApiTokenFactory;
}
```

### User Management

Flexible user model with repository pattern:

```typescript
interface IUserModel {
  getId(): string;
  getEmail(): string;
  getHashedPassword(): string;
  getAclRoles(): string[];
  getAclGroups(): string[];
  // ... other user methods
}

interface IUserRepository {
  findById(id: string): Promise<IUserModel | null>;
  findByEmail(email: string): Promise<IUserModel | null>;
  create(userData: Partial<IUserModel>): Promise<IUserModel>;
  update(id: string, userData: Partial<IUserModel>): Promise<IUserModel>;
  delete(id: string): Promise<void>;
}
```

### API Token Management

```typescript
interface IApiTokenModel {
  getId(): string;
  getUserId(): string;
  getToken(): string;
  getScopes(): string[];
  getOptions(): Record<string, unknown>;
  hasScope(scope: string, includeGroupScopes?: boolean): boolean;
  isRevoked(): boolean;
  isExpired(): boolean;
}

interface IApiTokenRepository {
  findOneActiveToken(token: string): Promise<IApiTokenModel | null>;
  create(tokenData: Partial<IApiTokenModel>): Promise<IApiTokenModel>;
  revokeToken(token: IApiTokenModel): Promise<void>;
  // ... other repository methods
}
```

## Configuration

### AuthConfig

```typescript
interface AuthConfig {
  drivers: {
    jwt: {
      name: 'jwt';
      options: {
        secret: string;
        expiresInMinutes: number;
        factory: {
          user: IUserFactoryConstructor;
          apiToken: IApiTokenFactoryConstructor;
        };
        repository: {
          user: IUserRepositoryConstructor;
          apiToken: IApiTokenRepositoryConstructor;
        };
      };
    };
  };
}
```

### ACL Integration

The auth service automatically integrates with Larascript ACL:

```typescript
// Access ACL service
const aclService = authService.acl();

// Check permissions
const canRead = await aclService.can(user, 'read', 'posts');
const canWrite = await aclService.can(user, 'write', 'posts');
```

## Advanced Usage

### Custom User Repository

Implement your own user repository for custom data sources:

```typescript
class CustomUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUserModel | null> {
    // Custom implementation
  }
  
  // ... implement other methods
}
```

### Token Management

```typescript
// Create API token for user
const apiToken = await jwtService.buildApiTokenByUser(user, ['read:posts']);

// Refresh token
const newToken = jwtService.refreshToken(apiToken);

// Revoke specific token
await jwtService.revokeToken(apiToken);

// Revoke all user tokens
await jwtService.revokeAllTokens(userId);
```

### Factory Pattern

The package uses factory pattern for creating users and API tokens:

```typescript
const userFactory = jwtService.getUserFactory();
const apiTokenFactory = jwtService.getApiTokenFactory();

const user = userFactory.create({
  email: 'user@example.com',
  hashedPassword: await jwtService.hashPassword('password'),
  aclRoles: ['user'],
  aclGroups: ['user']
});

const apiToken = apiTokenFactory.create({
  token: 'generated-token',
  scopes: ['read:posts'],
  options: {}
});
```

## Testing

Run the test suite:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

ISC
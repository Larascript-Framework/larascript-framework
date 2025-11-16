# Core Packages

The core packages form the foundation of the Larascript ecosystem. These packages provide essential functionality that other packages and applications depend on.

## 📦 Package Overview

### `@larascript-framework/larascript-core`
The foundation package containing base classes, interfaces, and core patterns for the Larascript Framework.

**Version**: 1.0.23  
**Dependencies**: `@larascript-framework/larascript-utils`

#### Key Components

##### Base Classes
```typescript
import { 
  BaseService, 
  BaseAdapter, 
  BaseProvider, 
  BaseConfig, 
  BaseSingleton 
} from '@larascript-framework/larascript-core';

// Base service for business logic
class UserService extends BaseService {
  async findById(id: string) {
    // Implementation
  }
}

// Base adapter for external integrations
class DatabaseAdapter extends BaseAdapter {
  async connect() {
    // Implementation
  }
}

// Base provider for dependency injection
class UserProvider extends BaseProvider {
  register() {
    // Register services
  }
}

// Base configuration class
class AppConfig extends BaseConfig {
  // Configuration implementation
}

// Base singleton for shared instances
class CacheManager extends BaseSingleton {
  // Singleton implementation
}
```

##### Core Interfaces
```typescript
import { 
  IService, 
  IProvider,
  IAdapter,
  IDependency,
  IHasConfigConcern 
} from '@larascript-framework/larascript-core';

// Service interface
interface IUserService extends IService {
  findById(id: string): Promise<User>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

// Provider interface
interface IUserProvider extends IProvider {
  register(): void;
  boot(): void;
}

// Adapter interface
interface IDatabaseAdapter extends IAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
```

##### Exception Classes
```typescript
import { 
  AdapterException,
  DependencyException,
  UninitializedContainerError 
} from '@larascript-framework/larascript-core';

// Custom exceptions
throw new AdapterException('Database connection failed');
throw new DependencyException('Service not found');
throw new UninitializedContainerError('Container not initialized');
```

#### Usage Examples

##### Service Implementation
```typescript
import { BaseService } from '@larascript-framework/larascript-core';

class UserService extends BaseService {
  constructor(config: any = null) {
    super(config);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    // Business logic
    const user = await this.userRepository.create(data);
    return user;
  }

  getConfig(): any {
    return this.config;
  }
}
```

##### Adapter Implementation
```typescript
import { BaseAdapter } from '@larascript-framework/larascript-core';

class DatabaseAdapter extends BaseAdapter {
  async connect(): Promise<void> {
    try {
      // Database connection logic
      await this.establishConnection();
    } catch (error) {
      throw new AdapterException('Database connection failed');
    }
  }

  async disconnect(): Promise<void> {
    // Cleanup connection
  }
}
```

##### Provider Implementation
```typescript
import { BaseProvider } from '@larascript-framework/larascript-core';

class UserProvider extends BaseProvider {
  register(): void {
    // Register services in the container
    this.container.bind('userService', UserService);
    this.container.bind('userRepository', UserRepository);
  }

  boot(): void {
    // Boot services after registration
    const userService = this.container.resolve('userService');
    // Initialize service
  }
}
```

##### Configuration Implementation
```typescript
import { BaseConfig } from '@larascript-framework/larascript-core';

class AppConfig extends BaseConfig {
  constructor() {
    super();
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    // Load configuration from environment or files
    this.set('database', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'larascript'
    });
  }
}
```

---

**Note**: Some components mentioned in the examples below (like `BaseController`, `ValidationException`, `NotFoundException`, `UnauthorizedException`) are part of the main Larascript Framework (`apps/larascript-framework`) and not the individual packages. They are shown here for completeness but should be imported from the main framework when building applications.

---

### `@larascript-framework/larascript-acl`
Access Control List system for flexible authorization.

**Version**: Latest  
**Dependencies**: `@larascript-framework/larascript-core`

#### Key Components

##### ACL Service
```typescript
import { BasicACLService } from '@larascript-framework/larascript-acl';

const acl = new BasicACLService();

// Define permissions
acl.define('user', ['read', 'write', 'delete']);
acl.define('admin', ['read', 'write', 'delete', 'manage']);

// Check permissions
const canRead = acl.can('user', 'read', 'post');
const canManage = acl.can('admin', 'manage', 'user');
```

##### Composable ACL
```typescript
import { ComposableACL } from '@larascript-framework/larascript-acl';

// Create composable ACL
const userACL = new ComposableACL()
  .can('read', 'post')
  .can('write', 'post')
  .cannot('delete', 'post');

const adminACL = new ComposableACL()
  .can('read', '*')
  .can('write', '*')
  .can('delete', '*')
  .can('manage', '*');

// Combine ACLs
const combinedACL = userACL.compose(adminACL);
```

#### Usage Examples

##### Basic Permission Checking
```typescript
import { BasicACLService } from '@larascript-framework/larascript-acl';

class PostController extends BaseController {
  constructor(private acl: BasicACLService) {
    super();
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    // Check if user can read posts
    if (!this.acl.can(user.role, 'read', 'post')) {
      throw new UnauthorizedException('Cannot read posts');
    }

    const post = await this.postService.findById(id);
    return this.success(res, post);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    // Check if user can delete posts
    if (!this.acl.can(user.role, 'delete', 'post')) {
      throw new UnauthorizedException('Cannot delete posts');
    }

    await this.postService.delete(id);
    return this.success(res, { message: 'Post deleted' });
  }
}
```

##### Role-Based Authorization
```typescript
import { BasicACLService } from '@larascript-framework/larascript-acl';

// Setup ACL with roles and permissions
const acl = new BasicACLService();

// Define roles and their permissions
acl.define('guest', ['read']);
acl.define('user', ['read', 'write']);
acl.define('moderator', ['read', 'write', 'moderate']);
acl.define('admin', ['read', 'write', 'moderate', 'manage']);

// Middleware for role checking
const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      throw new UnauthorizedException(`Requires ${role} role`);
    }
    next();
  };
};

// Middleware for permission checking
const requirePermission = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !acl.can(req.user.role, action, resource)) {
      throw new UnauthorizedException(`Cannot ${action} ${resource}`);
    }
    next();
  };
};
```

---

### `@larascript-framework/larascript-validator`
Comprehensive validation system with TypeScript integration.

**Version**: Latest  
**Dependencies**: `@larascript-framework/larascript-core`

#### Key Components

##### Validation Rules
```typescript
import { 
  Validator,
  ValidationRule,
  ValidatorException 
} from '@larascript-framework/larascript-validator';

// Create validator
const userValidator = new Validator({
  name: [
    new ValidationRule('required', 'Name is required'),
    new ValidationRule('string', 'Name must be a string'),
    new ValidationRule('minLength', 2, 'Name must be at least 2 characters'),
    new ValidationRule('maxLength', 50, 'Name must be less than 50 characters')
  ],
  email: [
    new ValidationRule('required', 'Email is required'),
    new ValidationRule('email', 'Invalid email format'),
    new ValidationRule('unique', 'users', 'email', 'Email already exists')
  ],
  age: [
    new ValidationRule('integer', 'Age must be an integer'),
    new ValidationRule('min', 18, 'Age must be at least 18'),
    new ValidationRule('max', 120, 'Age must be less than 120')
  ]
});
```

##### Custom Validators
```typescript
import { CustomValidator } from '@larascript-framework/larascript-validator';

// Custom validator for password strength
class PasswordStrengthValidator extends CustomValidator {
  validate(value: string): boolean {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  getMessage(): string {
    return 'Password must contain uppercase, lowercase, number, and special character';
  }
}

// Custom validator for unique values
class UniqueValidator extends CustomValidator {
  constructor(
    private table: string,
    private column: string,
    private excludeId?: string
  ) {
    super();
  }

  async validate(value: any): Promise<boolean> {
    // Database check implementation
    const exists = await this.checkExists(value);
    return !exists;
  }

  getMessage(): string {
    return `${this.column} already exists`;
  }
}
```

#### Usage Examples

##### Request Validation
```typescript
import { Validator } from '@larascript-framework/larascript-validator';

class UserController extends BaseController {
  constructor(private userValidator: Validator) {
    super();
  }

        async store(req: Request, res: Response) {
        try {
          // Validate request data
          const validatedData = await this.userValidator.validate(req.body);
          
          // Create user with validated data
          const user = await this.userService.create(validatedData);
          
          return this.success(res, user, 201);
        } catch (error) {
          if (error instanceof ValidatorException) {
            return this.validationError(res, error.message);
          }
          return this.error(res, error);
        }
      }

        async update(req: Request, res: Response) {
        try {
          const { id } = req.params;
          
          // Validate update data
          const validatedData = await this.userValidator.validate(req.body, { id });
          
          // Update user
          const user = await this.userService.update(id, validatedData);
          
          return this.success(res, user);
        } catch (error) {
          if (error instanceof ValidatorException) {
            return this.validationError(res, error.message);
          }
          return this.error(res, error);
        }
      }
}
```

##### Form Validation
```typescript
import { Validator } from '@larascript-framework/larascript-validator';

// Registration form validator
const registrationValidator = new Validator({
  username: [
    new ValidationRule('required', 'Username is required'),
    new ValidationRule('string', 'Username must be a string'),
    new ValidationRule('minLength', 3, 'Username must be at least 3 characters'),
    new ValidationRule('maxLength', 20, 'Username must be less than 20 characters'),
    new ValidationRule('pattern', /^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  ],
  password: [
    new ValidationRule('required', 'Password is required'),
    new ValidationRule('string', 'Password must be a string'),
    new ValidationRule('minLength', 8, 'Password must be at least 8 characters'),
    new ValidationRule('custom', new PasswordStrengthValidator(), 'Password is too weak')
  ],
  confirmPassword: [
    new ValidationRule('required', 'Password confirmation is required'),
    new ValidationRule('same', 'password', 'Passwords do not match')
  ],
  email: [
    new ValidationRule('required', 'Email is required'),
    new ValidationRule('email', 'Invalid email format'),
    new ValidationRule('custom', new UniqueValidator('users', 'email'), 'Email already exists')
  ]
});
```

---

### `@larascript-framework/larascript-logger`
Structured logging system with multiple transports.

**Version**: Latest  
**Dependencies**: None

#### Key Components

##### Logger Service
```typescript
import { Logger, LogLevel } from '@larascript-framework/larascript-logger';

// Create logger instance
const logger = new Logger({
  level: LogLevel.INFO,
  transports: ['console', 'file', 'database']
});

// Log messages
logger.info('User logged in', { userId: 123, timestamp: new Date() });
logger.error('Database connection failed', { error: 'Connection timeout' });
logger.warn('High memory usage detected', { usage: '85%' });
logger.debug('Processing request', { method: 'POST', path: '/api/users' });
```

##### Custom Transports
```typescript
import { LoggerTransport, LogEntry } from '@larascript-framework/larascript-logger';

// Custom transport for external logging service
class ExternalLoggingTransport implements LoggerTransport {
  async log(entry: LogEntry): Promise<void> {
    // Send to external service
    await fetch('https://logs.example.com/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  }
}

// Custom transport for Slack notifications
class SlackTransport implements LoggerTransport {
  constructor(private webhookUrl: string) {}

  async log(entry: LogEntry): Promise<void> {
    if (entry.level === 'error') {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Error: ${entry.message}`,
          attachments: [{ text: JSON.stringify(entry.meta, null, 2) }]
        })
      });
    }
  }
}
```

#### Usage Examples

##### Application Logging
```typescript
import { Logger } from '@larascript-framework/larascript-logger';

class Application {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({
      level: process.env.LOG_LEVEL || 'info',
      transports: ['console', 'file']
    });
  }

  async start() {
    try {
      this.logger.info('Starting application');
      
      // Initialize services
      await this.initializeServices();
      this.logger.info('Services initialized');
      
      // Start server
      await this.startServer();
      this.logger.info('Server started', { port: process.env.PORT });
      
    } catch (error) {
      this.logger.error('Failed to start application', { error: error.message });
      process.exit(1);
    }
  }

  private async initializeServices() {
    // Service initialization
  }

  private async startServer() {
    // Server startup
  }
}
```

##### Request Logging Middleware
```typescript
import { Logger } from '@larascript-framework/larascript-logger';

const logger = new Logger();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};
```

---

### `@larascript-framework/larascript-observer`
Event observer pattern implementation for decoupled communication.

**Version**: Latest  
**Dependencies**: None

#### Key Components

##### Observer Pattern
```typescript
import { Observer, EventEmitter } from '@larascript-framework/larascript-observer';

// Create event emitter
const eventEmitter = new EventEmitter();

// Create observers
class UserObserver extends Observer {
  async handle(event: string, data: any): Promise<void> {
    switch (event) {
      case 'user.created':
        await this.sendWelcomeEmail(data);
        break;
      case 'user.updated':
        await this.updateUserCache(data);
        break;
      case 'user.deleted':
        await this.cleanupUserData(data);
        break;
    }
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    // Send welcome email
  }

  private async updateUserCache(user: User): Promise<void> {
    // Update cache
  }

  private async cleanupUserData(user: User): Promise<void> {
    // Cleanup data
  }
}

class AuditObserver extends Observer {
  async handle(event: string, data: any): Promise<void> {
    // Log audit trail
    await this.auditService.log(event, data);
  }
}
```

#### Usage Examples

##### Service with Events
```typescript
import { EventEmitter } from '@larascript-framework/larascript-observer';

class UserService extends BaseService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    super();
    this.eventEmitter = eventEmitter;
  }

  async create(data: CreateUserData): Promise<User> {
    // Create user
    const user = await this.userRepository.create(data);
    
    // Emit events
    await this.eventEmitter.emit('user.created', user);
    
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    // Update user
    const user = await this.userRepository.update(id, data);
    
    // Emit events
    await this.eventEmitter.emit('user.updated', user);
    
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    
    // Delete user
    await this.userRepository.delete(id);
    
    // Emit events
    await this.eventEmitter.emit('user.deleted', user);
  }
}
```

##### Observer Registration
```typescript
import { EventEmitter, Observer } from '@larascript-framework/larascript-observer';

class Application {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.registerObservers();
  }

  private registerObservers(): void {
    // Register observers
    this.eventEmitter.register(new UserObserver());
    this.eventEmitter.register(new AuditObserver());
    this.eventEmitter.register(new NotificationObserver());
  }

  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}
```

---

### `@larascript-framework/larascript-views`
Template rendering and view management system.

**Version**: Latest  
**Dependencies**: None

#### Key Components

##### View Engine
```typescript
import { ViewEngine, ViewRenderer } from '@larascript-framework/larascript-views';

// Create view engine
const viewEngine = new ViewEngine({
  engine: 'ejs',
  viewsPath: './views',
  layoutPath: './views/layouts',
  partialsPath: './views/partials'
});

// Create renderer
const renderer = new ViewRenderer(viewEngine);
```

##### Template Rendering
```typescript
import { ViewRenderer } from '@larascript-framework/larascript-views';

class PageController extends BaseController {
  constructor(private renderer: ViewRenderer) {
    super();
  }

  async index(req: Request, res: Response) {
    const data = {
      title: 'Home Page',
      users: await this.userService.findAll(),
      currentUser: req.user
    };

    const html = await this.renderer.render('pages/index', data);
    res.send(html);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.userService.findById(id);

    const data = {
      title: `User: ${user.name}`,
      user: user
    };

    const html = await this.renderer.render('users/show', data);
    res.send(html);
  }
}
```

#### Usage Examples

##### Layout System
```ejs
<!-- views/layouts/main.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <%- include('../partials/head') %>
</head>
<body>
  <%- include('../partials/header') %>
  
  <main>
    <%- body %>
  </main>
  
  <%- include('../partials/footer') %>
</body>
</html>
```

##### Partial Templates
```ejs
<!-- views/partials/user-card.ejs -->
<div class="user-card">
  <h3><%= user.name %></h3>
  <p><%= user.email %></p>
  <p>Member since: <%= user.createdAt.toLocaleDateString() %></p>
</div>
```

---

### `@larascript-framework/larascript-collection`
Collection utilities and data structures.

**Version**: Latest  
**Dependencies**: None

#### Key Components

##### Collection Class
```typescript
import { Collection } from '@larascript-framework/larascript-collection';

// Create collection
const users = new Collection([
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
  { id: 3, name: 'Bob', email: 'bob@example.com' }
]);

// Collection operations
const activeUsers = users.filter(user => user.active);
const userNames = users.map(user => user.name);
const john = users.find(user => user.name === 'John');
const hasJane = users.contains(user => user.name === 'Jane');
```

##### Collection Methods
```typescript
import { Collection } from '@larascript-framework/larascript-collection';

const numbers = new Collection([1, 2, 3, 4, 5]);

// Basic operations
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Advanced operations
const chunked = numbers.chunk(2);
const grouped = numbers.groupBy(n => n % 2 === 0 ? 'even' : 'odd');
const sorted = numbers.sort((a, b) => a - b);
const unique = numbers.unique();
```

#### Usage Examples

##### Data Processing
```typescript
import { Collection } from '@larascript-framework/larascript-collection';

class UserService extends BaseService {
  async getActiveUsers(): Promise<Collection<User>> {
    const users = await this.userRepository.findAll();
    
    return new Collection(users)
      .filter(user => user.active)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(user => ({
        ...user,
        displayName: `${user.firstName} ${user.lastName}`
      }));
  }

  async getUsersByRole(role: string): Promise<Collection<User>> {
    const users = await this.userRepository.findAll();
    
    return new Collection(users)
      .filter(user => user.role === role)
      .groupBy('department');
  }

  async getTopUsers(limit: number): Promise<Collection<User>> {
    const users = await this.userRepository.findAll();
    
    return new Collection(users)
      .sort((a, b) => b.score - a.score)
      .take(limit);
  }
}
```

##### API Response Formatting
```typescript
import { Collection } from '@larascript-framework/larascript-collection';

class UserController extends BaseController {
  async index(req: Request, res: Response) {
    const users = await this.userService.findAll();
    const collection = new Collection(users);

    // Apply filters
    if (req.query.active) {
      collection.filter(user => user.active);
    }

    if (req.query.role) {
      collection.filter(user => user.role === req.query.role);
    }

    // Apply sorting
    if (req.query.sort) {
      collection.sort((a, b) => {
        const field = req.query.sort as string;
        return a[field].localeCompare(b[field]);
      });
    }

    // Apply pagination
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 10;
    const paginated = collection.paginate(page, perPage);

    return this.success(res, {
      data: paginated.items,
      pagination: {
        current_page: page,
        per_page: perPage,
        total: collection.count(),
        total_pages: Math.ceil(collection.count() / perPage)
      }
    });
  }
}
```

---

### `@larascript-framework/larascript-utils`
Common utility functions and helpers.

**Version**: Latest  
**Dependencies**: None

#### Key Components

##### String Utilities
```typescript
import { 
  StringUtils,
  slugify,
  camelCase,
  snakeCase,
  kebabCase 
} from '@larascript-framework/larascript-utils';

// String transformations
const slug = slugify('Hello World!'); // "hello-world"
const camel = camelCase('hello_world'); // "helloWorld"
const snake = snakeCase('helloWorld'); // "hello_world"
const kebab = kebabCase('helloWorld'); // "hello-world"

// String validation
const isValidEmail = StringUtils.isEmail('user@example.com');
const isValidUrl = StringUtils.isUrl('https://example.com');
const isStrongPassword = StringUtils.isStrongPassword('MyP@ssw0rd');
```

##### Array Utilities
```typescript
import { 
  ArrayUtils,
  chunk,
  flatten,
  unique,
  shuffle 
} from '@larascript-framework/larascript-utils';

// Array operations
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
const flattened = flatten([[1, 2], [3, 4], [5]]); // [1, 2, 3, 4, 5]
const uniqueItems = unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]
const shuffled = shuffle([1, 2, 3, 4, 5]); // Random order
```

##### Object Utilities
```typescript
import { 
  ObjectUtils,
  deepClone,
  deepMerge,
  pick,
  omit 
} from '@larascript-framework/larascript-utils';

// Object operations
const cloned = deepClone({ a: 1, b: { c: 2 } });
const merged = deepMerge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
const picked = pick({ a: 1, b: 2, c: 3 }, ['a', 'b']); // { a: 1, b: 2 }
const omitted = omit({ a: 1, b: 2, c: 3 }, ['c']); // { a: 1, b: 2 }
```

#### Usage Examples

##### Data Transformation
```typescript
import { 
  StringUtils,
  ObjectUtils,
  ArrayUtils 
} from '@larascript-framework/larascript-utils';

class UserService extends BaseService {
  async createUser(data: CreateUserData): Promise<User> {
    // Transform and validate data
    const transformedData = {
      ...data,
      username: StringUtils.slugify(data.name),
      email: StringUtils.normalizeEmail(data.email),
      password: await this.hashPassword(data.password)
    };

            // Validate transformed data
        if (!StringUtils.isEmail(transformedData.email)) {
          throw new Error('Invalid email format');
        }

    return await this.userRepository.create(transformedData);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    // Merge data
    const updatedData = ObjectUtils.deepMerge(user, data);
    
    return await this.userRepository.update(id, updatedData);
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    const users = await this.userRepository.findAll();
    
    return ArrayUtils.filter(users, user => user.department === department);
  }
}
```

##### API Response Helpers
```typescript
import { ObjectUtils, StringUtils } from '@larascript-framework/larascript-utils';

class ApiController extends BaseController {
  formatResponse(data: any, fields?: string[]): any {
    if (fields) {
      return ObjectUtils.pick(data, fields);
    }
    return data;
  }

  formatError(error: Error): any {
    return {
      message: error.message,
      code: StringUtils.snakeCase(error.constructor.name).toUpperCase(),
      timestamp: new Date().toISOString()
    };
  }

  paginateResponse(data: any[], page: number, perPage: number): any {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = data.slice(start, end);

    return {
      data: items,
      pagination: {
        current_page: page,
        per_page: perPage,
        total: data.length,
        total_pages: Math.ceil(data.length / perPage)
      }
    };
  }
}
```

---

## 🔗 Package Dependencies

### Dependency Graph
```
larascript-core
├── larascript-utils

larascript-acl
├── larascript-core
    └── larascript-utils

larascript-validator
├── larascript-core
    └── larascript-utils

larascript-logger
└── (no dependencies)

larascript-observer
└── (no dependencies)

larascript-views
└── (no dependencies)

larascript-collection
└── (no dependencies)

larascript-utils
└── (no dependencies)
```

### Installation

To use these packages in your project:

```bash
# Install specific packages
pnpm add @larascript-framework/larascript-core
pnpm add @larascript-framework/larascript-acl
pnpm add @larascript-framework/larascript-validator
pnpm add @larascript-framework/larascript-logger
pnpm add @larascript-framework/larascript-observer
pnpm add @larascript-framework/larascript-views
pnpm add @larascript-framework/larascript-collection
pnpm add @larascript-framework/larascript-utils

# Or install all core packages
pnpm add @larascript-framework/larascript-core @larascript-framework/larascript-acl @larascript-framework/larascript-validator @larascript-framework/larascript-logger @larascript-framework/larascript-observer @larascript-framework/larascript-views @larascript-framework/larascript-collection @larascript-framework/larascript-utils
```

---

**Next Steps**: [Utility Packages](./utility-packages.md) → [Development Tools](./dev-tools.md) → [Package Development](../package-development.md)

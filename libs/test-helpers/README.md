# @larascript-framework/test-helpers

A collection of test helper utilities for the Larascript framework, providing base classes and interfaces for creating in-memory test implementations.

## Installation

This package is part of the Larascript monorepo and is available as a workspace dependency:

```bash
pnpm add larascript-framework/test-helpers
```

## Features

### BaseModel

A base model class that provides common functionality for test models with attributes management.

```typescript
import { BaseModel, BaseModelAttributes } from '@larascript-framework/test-helpers';

interface UserAttributes extends BaseModelAttributes {
  name: string;
  email: string;
}

class User extends BaseModel<UserAttributes> {
  // Your user-specific methods here
}

const user = new User({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### BaseInMemoryRepository

An abstract base class for creating in-memory repositories for testing purposes. Provides both synchronous and asynchronous methods for all CRUD operations.

```typescript
import { BaseInMemoryRepository, BaseModel } from '@larascript-framework/test-helpers';

class UserRepository extends BaseInMemoryRepository<User> {
  constructor() {
    super(User);
  }
  
  // Add your repository-specific methods here
}

const userRepo = new UserRepository();

// Create a new user (async)
const user = await userRepo.create({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create a new user (sync)
const userSync = userRepo.createSync({
  id: '2',
  name: 'Jane Doe',
  email: 'jane@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Find by ID (async)
const foundUser = await userRepo.findById('1');

// Find by ID (sync)
const foundUserSync = userRepo.findByIdSync('1');

// Find one by field (async)
const userByName = await userRepo.findOne('name', 'John Doe');

// Find one by field (sync)
const userByNameSync = userRepo.findOneSync('name', 'John Doe');

// Find many by field (async)
const usersByEmail = await userRepo.findMany('email', 'john@example.com');

// Find many by field (sync)
const usersByEmailSync = userRepo.findManySync('email', 'john@example.com');

// Update a user (async)
await userRepo.update('id', '1', { name: 'John Updated' });

// Update a user (sync)
userRepo.updateSync('id', '1', { name: 'John Updated' });

// Delete a user (async)
await userRepo.delete('id', '1');

// Delete a user (sync)
userRepo.deleteSync('id', '1');

// Set test data (async)
await userRepo.setRecords([user1, user2, user3]);

// Set test data (sync)
userRepo.setRecordsSync([user1, user2, user3]);

// Get all records (async)
const allUsers = await userRepo.getRecords();

// Get all records (sync)
const allUsersSync = userRepo.getRecordsSync();

// Clear all records (async)
await userRepo.clearRecords();

// Clear all records (sync)
userRepo.clearRecordsSync();
```

## API Reference

### BaseModel

#### `BaseModelAttributes`
Interface defining the base attributes that all models should have:
- `id: string` - Unique identifier
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last update timestamp

#### `IBaseModel<Attributes>`
Interface defining the contract for base models:
- `attributes: Attributes` - The model's attributes
- `setAttributes(attributes: Attributes): void` - Set the model's attributes
- `getAttributes(): Attributes` - Get the model's attributes
- `getId(): string` - Get the model's ID
- `getCreatedAt(): Date` - Get the creation date
- `getUpdatedAt(): Date` - Get the last update date

#### `BaseModel<Attributes>`
Concrete implementation of `IBaseModel` that provides the base functionality.

### BaseInMemoryRepository

#### `IBaseInMemoryRepository<T>`
Interface defining the contract for in-memory repositories with both sync and async methods:

**Query Methods:**
- `findOne(where: string, value: unknown): Promise<T | null>` - Find one record by field value (async)
- `findOneSync(where: string, value: unknown): T | null` - Find one record by field value (sync)
- `findById(id: string): Promise<T | null>` - Find record by ID (async)
- `findByIdSync(id: string): T | null` - Find record by ID (sync)
- `findMany(where: string, value: unknown): Promise<T[]>` - Find multiple records by field value (async)
- `findManySync(where: string, value: unknown): T[]` - Find multiple records by field value (sync)

**Mutation Methods:**
- `create(attributes: T['attributes']): Promise<T>` - Create and store a new record (async)
- `createSync(attributes: T['attributes']): T` - Create and store a new record (sync)
- `update(where: string, value: unknown, data: Partial<T['attributes']>): Promise<void>` - Update records matching criteria (async)
- `updateSync(where: string, value: unknown, data: Partial<T['attributes']>): void` - Update records matching criteria (sync)
- `delete(where: string, value: unknown): Promise<void>` - Delete records matching criteria (async)
- `deleteSync(where: string, value: unknown): void` - Delete records matching criteria (sync)

**Data Management Methods:**
- `setRecords(data: T[]): Promise<void>` - Set the repository's records (async)
- `setRecordsSync(data: T[]): void` - Set the repository's records (sync)
- `getRecords(): Promise<T[]>` - Get all records (async)
- `getRecordsSync(): T[]` - Get all records (sync)
- `clearRecords(): Promise<void>` - Clear all records (async)
- `clearRecordsSync(): void` - Clear all records (sync)

#### `BaseInMemoryRepository<T>`
Abstract base class implementing `IBaseInMemoryRepository` with complete CRUD functionality.

## Usage Examples

### Creating a Test Model

```typescript
import { BaseModel, BaseModelAttributes } from '@larascript-framework/test-helpers';

interface ProductAttributes extends BaseModelAttributes {
  name: string;
  price: number;
  category: string;
}

class Product extends BaseModel<ProductAttributes> {
  getName(): string {
    return this.attributes.name;
  }
  
  getPrice(): number {
    return this.attributes.price;
  }
  
  getCategory(): string {
    return this.attributes.category;
  }
}
```

### Creating a Test Repository

```typescript
import { BaseInMemoryRepository } from '@larascript-framework/test-helpers';

class ProductRepository extends BaseInMemoryRepository<Product> {
  constructor() {
    super(Product);
  }
  
  // Custom methods using the base functionality
  async findByCategory(category: string): Promise<Product[]> {
    return this.findManySync('category', category);
  }
  
  async findByName(name: string): Promise<Product | null> {
    return this.findOneSync('name', name);
  }
  
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const allProducts = this.getRecordsSync();
    return allProducts.filter(product => 
      product.getPrice() >= minPrice && product.getPrice() <= maxPrice
    );
  }
}
```

### Setting Up Test Data

```typescript
describe('ProductRepository', () => {
  let repository: ProductRepository;
  
  beforeEach(async () => {
    repository = new ProductRepository();
    
    // Set up test data using async methods
    await repository.setRecords([
      new Product({
        id: '1',
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      new Product({
        id: '2',
        name: 'Desk Chair',
        price: 199.99,
        category: 'Furniture',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    ]);
  });
  
  afterEach(async () => {
    await repository.clearRecords();
  });
  
  it('should find products by category', async () => {
    const electronics = await repository.findByCategory('Electronics');
    expect(electronics).toHaveLength(1);
    expect(electronics[0].getName()).toBe('Laptop');
  });
  
  it('should find product by name', async () => {
    const laptop = await repository.findByName('Laptop');
    expect(laptop).not.toBeNull();
    expect(laptop?.getPrice()).toBe(999.99);
  });
  
  it('should update product price', async () => {
    await repository.update('id', '1', { price: 899.99 });
    const updatedLaptop = await repository.findById('1');
    expect(updatedLaptop?.getPrice()).toBe(899.99);
  });
});
```

### Using Synchronous Methods for Simple Tests

```typescript
describe('ProductRepository Sync', () => {
  let repository: ProductRepository;
  
  beforeEach(() => {
    repository = new ProductRepository();
    
    // Set up test data using sync methods
    repository.setRecordsSync([
      new Product({
        id: '1',
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    ]);
  });
  
  afterEach(() => {
    repository.clearRecordsSync();
  });
  
  it('should find product by ID synchronously', () => {
    const laptop = repository.findByIdSync('1');
    expect(laptop).not.toBeNull();
    expect(laptop?.getName()).toBe('Laptop');
  });
  
  it('should create product synchronously', () => {
    const newProduct = repository.createSync({
      id: '2',
      name: 'Mouse',
      price: 29.99,
      category: 'Electronics',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    expect(newProduct.getName()).toBe('Mouse');
    expect(repository.getRecordsSync()).toHaveLength(2);
  });
});
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

## Contributing

This package follows the Larascript monorepo conventions:

- All TypeScript source files are in the `src` directory
- Exports are defined in `src/index.ts`
- Tests are in the `src/tests` directory
- Configuration extends from the base monorepo configs

## License

ISC
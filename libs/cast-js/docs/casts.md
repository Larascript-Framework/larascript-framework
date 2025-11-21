# Casts Module

A type casting system for safely converting data between different types with proper error handling.

## Quick Start

```typescript
import { Castable } from '@larascript/utils-bundle/casts';

const castable = new Castable();

// Cast individual values
const number = castable.getCast("123", "number"); // 123
const boolean = castable.getCast("true", "boolean"); // true

// Cast object properties
const data = { age: "25", isActive: "true" };
const casts = { age: "number", isActive: "boolean" };
const result = castable.getCastFromObject(data, casts);
// Result: { age: 25, isActive: true }
```

## Supported Types

- `string`, `number`, `integer`, `float`, `boolean`
- `array`, `object`, `date`, `bigint`
- `map`, `set`, `symbol`, `null`, `undefined`

## Multiple Ways to Perform Casts

### 1. Direct Castable Instance
```typescript
import { Castable } from '@larascript/utils-bundle/casts';

const castable = new Castable();

// Individual value casting
const number = castable.getCast("123", "number"); // 123
const boolean = castable.getCast("true", "boolean"); // true
const date = castable.getCast("2024-01-01", "date"); // Date object
const array = castable.getCast('["a","b"]', "array"); // ["a", "b"]

// Object casting with explicit casts
const data = { age: "25", isActive: "true", joinDate: "2024-01-01" };
const casts = { age: "number", isActive: "boolean", joinDate: "date" };
const result = castable.getCastFromObject(data, casts);
```

### 2. Class Extension with BaseCastable
```typescript
import { BaseCastable } from '@larascript/utils-bundle/casts';

class User extends BaseCastable {
  casts = {
    age: "number",
    isActive: "boolean",
    joinDate: "date",
    score: "float",
    rank: "integer",
    items: "array",
    settings: "object",
    userId: "bigint",
    userType: "symbol"
  };
}

const user = new User();
const data = {
  age: "25",
  isActive: "1",
  joinDate: "2024-01-01",
  score: "91.5",
  rank: "1",
  items: '["item1", "item2"]',
  settings: '{"theme":"dark"}',
  userId: "1234567890",
  userType: "premium"
};

const result = user.getCastFromObject(data);
// Properties are automatically cast according to the class's casts definition
```

### 3. Utility Function
```typescript
import castObject from '@larascript/utils-bundle/casts/castObject';

const data = { age: "25", isActive: "true", joinDate: "2024-01-01" };
const casts = { age: "number", isActive: "boolean", joinDate: "date" };

const result = castObject(data, casts);
// Result: { age: 25, isActive: true, joinDate: Date object }
```

### 4. Mixin Pattern
```typescript
import { HasCastableConcern } from '@larascript/utils-bundle/casts';

class MyClass {
  // Your existing class implementation
}

const MyClassWithCasting = HasCastableConcern(MyClass);
const instance = new MyClassWithCasting();

// Set up casts
instance.casts = { age: "number", isActive: "boolean" };

// Use casting methods
const data = { age: "25", isActive: "true" };
const result = instance.getCastFromObject(data);
```

### 5. Error Handling Configuration
```typescript
// Throw exceptions (default behavior)
const castable = new Castable();

// Return null on errors instead of throwing
const castable = new Castable({ returnNullOnException: true });

try {
  const result = castable.getCast("invalid", "number");
} catch (error) {
  if (error instanceof CastException) {
    // Handle casting error
  }
}
```

## Advanced Casting Examples

### Type-Safe Object Casting
```typescript
interface UserData {
  age: number;
  isActive: boolean;
  joinDate: Date;
  score: number;
  rank: number;
  items: string[];
  settings: { theme: string };
  userId: bigint;
  userType: symbol;
}

class User extends BaseCastable {
  casts = {
    age: "number",
    isActive: "boolean",
    joinDate: "date",
    score: "float",
    rank: "integer",
    items: "array",
    settings: "object",
    userId: "bigint",
    userType: "symbol"
  };
}

const user = new User();
const result = user.getCastFromObject<UserData>(data);
// result is fully typed as UserData
```

### Performance Optimization
```typescript
// Only properties defined in casts are processed
const data = {
  age: "25",
  isActive: "true",
  name: "John", // This won't be processed
  email: "john@example.com" // This won't be processed
};

const casts = { age: "number", isActive: "boolean" };
const result = castable.getCastFromObject(data, casts);
// Only age and isActive are cast, name and email remain unchanged
```

## Key Features

- **Type Safety**: Validates types before casting
- **Flexible**: Works with individual values or entire objects
- **Extensible**: Can be mixed into existing classes
- **Error Handling**: Custom exceptions with optional null fallback
- **Performance**: Only processes defined properties in object casting
- **Multiple Patterns**: Choose the approach that best fits your use case

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

## Usage Patterns

### Class Extension
```typescript
import { BaseCastable } from '@larascript/utils-bundle/casts';

class User extends BaseCastable {
  casts = {
    age: "number",
    isActive: "boolean",
    joinDate: "date"
  };
}

const user = new User();
const result = user.getCastFromObject({ age: "25", isActive: "true" });
```

### Utility Function
```typescript
import castObject from '@larascript/utils-bundle/casts/castObject';

const result = castObject(
  { age: "25", isActive: "true" },
  { age: "number", isActive: "boolean" }
);
```

### Mixin
```typescript
import { HasCastableConcern } from '@larascript/utils-bundle/casts';

const MyClassWithCasting = HasCastableConcern(MyClass);
const instance = new MyClassWithCasting();
instance.casts = { age: "number" };
```

## Error Handling

```typescript
import { CastException } from '@larascript/utils-bundle/casts';

// Throw exceptions (default)
const castable = new Castable();

// Return null on errors
const castable = new Castable({ returnNullOnException: true });

try {
  const result = castable.getCast("invalid", "number");
} catch (error) {
  if (error instanceof CastException) {
    // Handle casting error
  }
}
```

## Key Features

- **Type Safety**: Validates types before casting
- **Flexible**: Works with individual values or entire objects
- **Extensible**: Can be mixed into existing classes
- **Error Handling**: Custom exceptions with optional null fallback
- **Performance**: Only processes defined properties in object casting

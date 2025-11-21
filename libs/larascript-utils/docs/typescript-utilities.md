# TypeScript Utilities

Utility types that enhance TypeScript development experience with better type hints.

## Quick Start

```typescript
import { TPrettify } from '@larascript/utils-bundle/interfaces';

// Clean up intersection types for better IDE hints
type User = { id: number; name: string } & { email: string; role: string };
type CleanUser = TPrettify<User>;
// Result: { id: number; name: string; email: string; role: string }
```

## API Reference

### `TPrettify<T>`

Expands complex TypeScript types into cleaner, more readable object types.

**Parameters:**
- `T` - The type to prettify

**Returns:** Cleaner version of the input type

## Usage Examples

### Basic Intersection Cleanup
```typescript
type ComplexType = { name: string } & { age: number } & { email: string };
type CleanType = TPrettify<ComplexType>;
// Result: { name: string; age: number; email: string }
```

### API Response Types
```typescript
type ApiResponse<T> = { data: T } & { status: number; message: string };
type UserData = { id: number; name: string } & { profile: { avatar: string } };

type CleanApiResponse = TPrettify<ApiResponse<UserData>>;
// Cleaner type hints in IDE
```

### Nested Types
```typescript
type Address = { street: string; city: string } & { zip: string };
type Person = { name: string; address: Address };

type CleanPerson = TPrettify<Person>;
// Expands nested intersection types
```

## When to Use

- **Better IDE Support**: Get cleaner type hints and autocomplete
- **Complex Types**: Simplify intersection and nested types
- **API Documentation**: Make type definitions more readable
- **Debugging**: Easier to understand complex type structures

## Key Features

- **Zero Runtime Cost**: Pure TypeScript utility
- **Type Safety**: Preserves all type information
- **IDE Enhancement**: Better IntelliSense and autocomplete

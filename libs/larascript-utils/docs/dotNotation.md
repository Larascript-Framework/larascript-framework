# Dot Notation Module

A powerful data extraction system for accessing nested object properties using dot notation with support for arrays and wildcards.

## Quick Start

```typescript
import { DotNotationDataExtrator } from '@larascript/utils-bundle/dotNotation';

// Extract single value
const data = { user: { name: "John", email: "john@example.com" } };
const result = DotNotationDataExtrator.reduceOne(data, "user.name");
// Result: { "user.name": "John" }

// Extract multiple values
const result = DotNotationDataExtrator.reduceMany(data, ["user.name", "user.email"]);
// Result: { "user.name": "John", "user.email": "john@example.com" }
```

## Supported Path Formats

- **Simple keys**: `"name"`, `"0"`
- **Nested paths**: `"user.name"`, `"users.0.profile.email"`
- **Array indexing**: `"users.0.name"`, `"items.1.2"`
- **Wildcards**: `"users.*.name"`, `"departments.*.employees.*.name"`

## Usage Patterns

### Single Value Extraction
```typescript
import { DotNotationDataExtrator } from '@larascript/utils-bundle/dotNotation';

const data = {
  user: {
    profile: {
      name: "John",
      settings: { theme: "dark" }
    }
  }
};

const result = DotNotationDataExtrator.reduceOne(data, "user.profile.name");
// Result: { "user.profile.name": "John" }
```

### Multiple Value Extraction
```typescript
const data = {
  users: [
    { name: "John", email: "john@example.com" },
    { name: "Jane", email: "jane@example.com" }
  ]
};

const result = DotNotationDataExtrator.reduceMany(data, [
  "users.0.name",
  "users.1.email"
]);
// Result: { "users.0.name": "John", "users.1.email": "jane@example.com" }
```

### Wildcard Array Processing
```typescript
const data = {
  departments: [
    {
      employees: [{ name: "John" }, { name: "Jane" }]
    },
    {
      employees: [{ name: "Bob" }, { name: "Alice" }]
    }
  ]
};

const result = DotNotationDataExtrator.reduceOne(data, "departments.*.employees.*.name");
// Result: { "departments.*.employees.*.name": ["John", "Jane", "Bob", "Alice"] }
```

### Path Parsing
```typescript
import { DotNotationParser } from '@larascript/utils-bundle/dotNotation';

const parser = DotNotationParser.parse("users.0.profile.email");

parser.getFirst();     // "users"
parser.getNext();      // 0
parser.getRest();      // "0.profile.email"
parser.getParts();     // ["users", "0", "profile", "email"]
parser.isNestedIndex(); // true

// Move forward in path
parser.forward(1);
parser.getFirst();     // 0
parser.getRest();      // "profile.email"
```

## Error Handling

```typescript
import { DotNotationParserException } from '@larascript/utils-bundle/dotNotation';

try {
  const parser = new DotNotationParser();
  parser.getFirst(); // Throws DotNotationParserException
} catch (error) {
  if (error instanceof DotNotationParserException) {
    // Handle parsing error
  }
}
```

## Key Features

- **Deep Nesting**: Access properties at any depth using dot notation
- **Array Support**: Navigate through arrays with numeric indices
- **Wildcard Processing**: Extract values from all array elements using `*`
- **Type Safety**: Automatic type conversion for numeric indices
- **Performance**: Efficient recursive traversal with early termination
- **Flexible**: Works with any JavaScript object structure

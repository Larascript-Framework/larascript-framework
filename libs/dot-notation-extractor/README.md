# Dot Notation Extractor

A TypeScript library for extracting data from nested objects using dot notation paths with support for array indexing and wildcards.

## Features

- **Dot Notation Paths**: Extract values using paths like `user.profile.name`
- **Array Indexing**: Access array elements with `users.0.name`
- **Wildcard Support**: Extract all array elements with `users.*.name`
- **Multiple Paths**: Extract multiple values in a single operation
- **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install ben-shepherd/dot-notation-extractor
```

## Usage

### Basic Extraction

```typescript
import { DotNotationDataExtrator } from '@ben-shepherd/dot-notation-extractor';

const data = {
  user: {
    name: 'John',
    email: 'john@example.com',
    profile: {
      age: 30,
      city: 'New York'
    }
  }
};

// Extract single value
const result = DotNotationDataExtrator.reduceOne(data, 'user.name');
// Result: { 'user.name': 'John' }

// Extract multiple values
const results = DotNotationDataExtrator.reduceMany(data, [
  'user.name',
  'user.profile.age'
]);
// Result: { 'user.name': 'John', 'user.profile.age': 30 }
```

### Array Operations

```typescript
const data = {
  users: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ]
};

// Access specific array element
const user = DotNotationDataExtrator.reduceOne(data, 'users.0.name');
// Result: { 'users.0.name': 'John' }

// Extract all names using wildcard
const names = DotNotationDataExtrator.reduceOne(data, 'users.*.name');
// Result: { 'users.*.name': ['John', 'Jane'] }
```

### Nested Arrays

```typescript
const data = {
  departments: [
    {
      name: 'Engineering',
      employees: [
        { name: 'John', role: 'Developer' },
        { name: 'Jane', role: 'Designer' }
      ]
    },
    {
      name: 'Marketing',
      employees: [
        { name: 'Bob', role: 'Manager' }
      ]
    }
  ]
};

// Extract all employee names across departments
const allNames = DotNotationDataExtrator.reduceOne(
  data, 
  'departments.*.employees.*.name'
);
// Result: { 'departments.*.employees.*.name': ['John', 'Jane', 'Bob'] }
```

## API Reference

### `DotNotationDataExtrator.reduceOne(data, path)`

Extracts a single value from the data object.

- **data**: The source object to extract from
- **path**: Dot notation path (e.g., `'user.profile.name'`)
- **returns**: Object with the path as key and extracted value

### `DotNotationDataExtrator.reduceMany(data, paths)`

Extracts multiple values from the data object.

- **data**: The source object to extract from
- **paths**: Array of dot notation paths
- **returns**: Object with paths as keys and extracted values

## Path Syntax

- **Simple keys**: `name`, `email`
- **Nested paths**: `user.profile.name`
- **Array indexing**: `users.0.name`
- **Wildcards**: `users.*.name` (extracts all array elements)
- **Mixed paths**: `departments.0.employees.*.name`

## License

ISC


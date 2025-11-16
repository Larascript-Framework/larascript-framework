# Larascript Collection

A TypeScript collection library that provides a Laravel-inspired collection interface with **proxy support for direct array-like access**. Built on top of [collect.js](https://collect.js.org/) for powerful data manipulation capabilities.

## Main Benefit: Proxy-Based Array Access

The primary advantage of this package is its **proxy implementation**, which allows you to access collection items directly using numerical indexes, just like a regular array:

```typescript
import { collect } from '@ben-shepherd/larascript-collection';

const users = collect([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
]);

// Direct array-like access - this is the main benefit!
console.log(users[0]); // { id: 1, name: 'John' }
console.log(users[1].name); // 'Jane'

// Set values directly
users[2] = { id: 4, name: 'Alice' };

// Iterate like a regular array
for (let i = 0; i < users.count(); i++) {
  console.log(users[i].name);
}
```

This proxy functionality makes collections feel like native arrays while providing all the powerful collection methods you need.

## Features

- **🔄 Proxy-based array access**: Use numerical indexes directly (`collection[0]`)
- **⛓️ Method chaining**: Fluent interface for data manipulation
- **🎯 TypeScript support**: Full type safety with generics
- **🚀 Laravel-inspired API**: Familiar methods like `map`, `filter`, `where`, etc.
- **📊 Aggregation methods**: `sum`, `average`, `max`, `min` for object properties
- **🎯 Zero learning curve**: Works exactly like arrays you already know

## Installation

```bash
npm install ben-shepherd/larascript-collection
```

## Quick Start

```typescript
import { collect } from '@ben-shepherd/larascript-collection';

// Create a collection
const numbers = collect([1, 2, 3, 4, 5]);

// Direct array access - the main benefit!
console.log(numbers[0]); // 1
console.log(numbers[2]); // 3

// Set values directly
numbers[1] = 10;

// Method chaining
const doubled = numbers
  .filter(n => n > 2)
  .map(n => n * 2)
  .all();

console.log(doubled); // [6, 8, 10]
```

## Why Use This Package?

### Traditional Collection Libraries
```typescript
// Other libraries require method calls
const traditional = someCollection.get(0);
const item = traditional.find(item => item.id === 1);
```

### Larascript Collection Bundle
```typescript
// Direct array access - much more intuitive!
const users = collect([{ id: 1, name: 'John' }]);
console.log(users[0].name); // 'John'

// Still get all collection methods
const john = users.find(user => user.id === 1);
```

## Basic Usage

### Creating Collections

```typescript
// Empty collection
const empty = collect();

// From array
const numbers = collect([1, 2, 3]);

// From object array
const users = collect([
  { id: 1, name: 'John', age: 25 },
  { id: 2, name: 'Jane', age: 30 },
  { id: 3, name: 'Bob', age: 35 }
]);
```

### Direct Array Access (Main Feature)

```typescript
const collection = collect(['a', 'b', 'c']);

// Get by index - just like arrays!
console.log(collection[0]); // 'a'
console.log(collection[1]); // 'b'
console.log(collection[2]); // 'c'

// Set by index - just like arrays!
collection[2] = 'z';
collection[0] = 'x';

// Access nested properties
const users = collect([
  { name: 'John', profile: { email: 'john@example.com' } }
]);
console.log(users[0].profile.email); // 'john@example.com'

// Iterate like a regular array
for (let i = 0; i < collection.count(); i++) {
  console.log(collection[i]);
}
```

### Traditional Methods (Still Available)

```typescript
const collection = collect(['a', 'b', 'c']);

// You can still use traditional methods
console.log(collection.get(1)); // 'b'
collection.set(1, 'y');
```

### Iteration Methods

```typescript
const numbers = collect([1, 2, 3, 4, 5]);

// forEach
numbers.forEach((item, index) => {
  console.log(`Item ${index}: ${item}`);
});

// map
const doubled = numbers.map(n => n * 2).all(); // [2, 4, 6, 8, 10]

// filter
const evens = numbers.filter(n => n % 2 === 0).all(); // [2, 4]

// find
const firstEven = numbers.find(n => n % 2 === 0); // 2
```

### Adding and Removing Items

```typescript
const collection = collect([1, 2, 3]);

// Add items
collection.add(4);
collection.add(5);

// Remove by index
collection.remove(1); // Removes item at index 1

// Get first/last
console.log(collection.first()); // 1
console.log(collection.last()); // 5
```

### Aggregation Methods

```typescript
const products = collect([
  { name: 'Laptop', price: 999 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
]);

// Sum
console.log(products.sum('price')); // 1099

// Average
console.log(products.average('price')); // 366.33...

// Max/Min
console.log(products.max('price')); // 999
console.log(products.min('price')); // 25
```

### Filtering with Conditions

```typescript
const users = collect([
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
]);

// Filter by conditions
const activeUsers = users
  .where('active', '===', true)
  .where('age', '>=', 30)
  .all();

console.log(activeUsers); // [{ name: 'Bob', age: 35, active: true }]
```

### Utility Methods

```typescript
const collection = collect([1, 2, 3]);

// Count items
console.log(collection.count()); // 3

// Check if empty
console.log(collection.isEmpty()); // false

// Clone collection
const cloned = collection.clone();

// Convert to array
const array = collection.toArray(); // [1, 2, 3]

// Get all items
const all = collection.all(); // [1, 2, 3]
```

## API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `collect(items?)` | Create a new collection | `Collection<T>` |
| `all()` | Get all items as array | `T[]` |
| `toArray()` | Convert to array | `T[]` |
| `count()` | Get item count | `number` |
| `isEmpty()` | Check if empty | `boolean` |

### Array Access (Proxy Feature)

| Access | Description | Example |
|--------|-------------|---------|
| `collection[index]` | Get item at index | `users[0]` |
| `collection[index] = value` | Set item at index | `users[1] = newUser` |

### Access Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `get(index)` | Get item at index | `T` |
| `set(index, value)` | Set item at index | `void` |
| `first()` | Get first item | `T \| null` |
| `last()` | Get last item | `T \| null` |

### Modification Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `add(item)` | Add item to end | `this` |
| `remove(index)` | Remove item at index | `this` |
| `clone()` | Create deep copy | `this` |

### Iteration Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `forEach(callback)` | Execute for each item | `this` |
| `map(callback)` | Transform items | `this` |
| `filter(callback)` | Filter items | `this` |
| `find(callback)` | Find first match | `T \| undefined` |

### Aggregation Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `sum(column)` | Sum of column values | `number \| string` |
| `average(column)` | Average of column values | `number` |
| `max(column)` | Maximum column value | `number` |
| `min(column)` | Minimum column value | `number` |

### Filtering Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `where(column, operator, value)` | Filter by condition | `this` |

**Supported operators**: `===`, `==`, `!==`, `!=`, `<>`, `>`, `<`, `>=`, `<=`

## TypeScript Support

The library provides full TypeScript support with generics:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users = collect<User>([
  { id: 1, name: 'John', email: 'john@example.com' }
]);

// TypeScript knows the type - even with direct access!
console.log(users[0].name); // ✅ TypeScript knows user.name is string
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.


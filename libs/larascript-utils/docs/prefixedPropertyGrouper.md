# Prefixed Property Grouper

A utility class that processes objects by moving properties with specific prefixes into nested objects. Perfect for transforming flattened database results into structured objects.

## Quick Start

```typescript
import { PrefixedPropertyGrouper } from '@larascript/utils-bundle/utils/prefixedPropertyGrouper';

const flattenedData = [
  { user_id: 1, user_name: 'John', address_street: '123 Main St', address_city: 'Boston' },
  { user_id: 2, user_name: 'Jane', address_street: '456 Park Ave', address_city: 'New York' }
];

const options = [
  { columnPrefix: 'user_', targetProperty: 'user' },
  { columnPrefix: 'address_', targetProperty: 'address' }
];

const result = PrefixedPropertyGrouper.handleArray(flattenedData, options);

// Result:
// [
//   {
//     user: { id: 1, name: 'John' },
//     address: { street: '123 Main St', city: 'Boston' }
//   },
//   {
//     user: { id: 2, name: 'Jane' },
//     address: { street: '456 Park Ave', city: 'New York' }
//   }
// ]
```

## API Reference

### Constructor
```typescript
const grouper = new PrefixedPropertyGrouper();
```

### Methods

#### `addOption(column: string, targetProperty: string)`
Adds a grouping rule with automatic prefix handling.

**Parameters:**
- `column` - The base column name (automatically adds '_' prefix)
- `targetProperty` - The target property where prefixed properties will be grouped

**Example:**
```typescript
grouper.addOption('user', 'user'); // Creates prefix 'user_'
grouper.addOption('address', 'address'); // Creates prefix 'address_'
```

#### `format<T>(arr: object[], options?: PrefixToTargetPropertyOptions)`
Formats an array of objects by applying the defined prefix groupings.

**Parameters:**
- `arr` - Array of objects to format
- `options` - Optional array of grouping options (uses stored options if not provided)

**Returns:** Formatted array of objects with grouped properties

**Example:**
```typescript
const result = grouper.format(data);
// or with custom options
const result = grouper.format(data, [
  { columnPrefix: 'temp_', targetProperty: 'temp' }
]);
```

#### `handleArray<T>(arr: T[], options: PrefixToTargetPropertyOptions)`
Static method to process an array of objects with explicit options.

#### `handleItem<T>(item: T, options: PrefixToTargetPropertyOptions)`
Processes a single object with the specified grouping options.

## Configuration Options

### PrefixToTargetPropertyOptions
```typescript
type PrefixToTargetPropertyOptions = {
  columnPrefix: string;           // The prefix to match (e.g., 'user_')
  targetProperty: string;         // Target property name
  setTargetPropertyNullWhenObjectAllNullish?: boolean; // Handle null values
}[];
```

## Usage Patterns

### Database Join Results
```typescript
// SQL JOIN result with prefixed columns
const joinResult = [
  {
    id: 1,
    name: 'John Doe',
    user_id: 1,
    user_email: 'john@example.com',
    user_role: 'admin',
    profile_avatar: 'avatar.jpg',
    profile_bio: 'Software developer'
  }
];

const grouper = new PrefixedPropertyGrouper();
grouper.addOption('user', 'user');
grouper.addOption('profile', 'profile');

const structured = grouper.format(joinResult);
// Result: [{
//   id: 1,
//   name: 'John Doe',
//   user: { id: 1, email: 'john@example.com', role: 'admin' },
//   profile: { avatar: 'avatar.jpg', bio: 'Software developer' }
// }]
```

### API Response Normalization
```typescript
// External API response with prefixed fields
const apiResponse = [
  {
    order_id: 123,
    order_status: 'pending',
    customer_first_name: 'John',
    customer_last_name: 'Doe',
    customer_email: 'john@example.com',
    shipping_address_line1: '123 Main St',
    shipping_address_city: 'Boston'
  }
];

const options = [
  { columnPrefix: 'order_', targetProperty: 'order' },
  { columnPrefix: 'customer_', targetProperty: 'customer' },
  { columnPrefix: 'shipping_address_', targetProperty: 'shippingAddress' }
];

const normalized = PrefixedPropertyGrouper.handleArray(apiResponse, options);
```

### Null Value Handling
```typescript
const data = [
  {
    user_id: 1,
    user_name: 'John',
    user_email: null,
    user_phone: null
  }
];

const options = [
  {
    columnPrefix: 'user_',
    targetProperty: 'user',
    setTargetPropertyNullWhenObjectAllNullish: true
  }
];

const result = PrefixedPropertyGrouper.handleArray(data, options);
// Result: [{ user: null }] - since all user properties are null
```

### Static Usage
```typescript
// One-time processing without creating an instance
const data = [{ temp_name: 'Test', temp_value: 123 }];

const result = PrefixedPropertyGrouper.handleArray(data, [
  { columnPrefix: 'temp_', targetProperty: 'temp' }
]);
```

## Key Features

- **Prefix Matching**: Automatically groups properties by common prefixes
- **Null Handling**: Optional null value consolidation for cleaner output
- **Flexible Configuration**: Supports custom prefixes and target properties
- **Batch Processing**: Efficiently processes arrays of objects
- **Type Safety**: Full TypeScript support with generic types
- **Static Methods**: Can be used without instantiation

## Error Handling

The utility safely handles various edge cases:

```typescript
const data = [{ name: 'John', user_id: 1 }];

// Missing prefixed properties are ignored
const result = PrefixedPropertyGrouper.handleArray(data, [
  { columnPrefix: 'nonexistent_', targetProperty: 'nonexistent' }
]);

// Non-string prefixes are handled gracefully
const result2 = PrefixedPropertyGrouper.handleArray(data, [
  { columnPrefix: '', targetProperty: 'empty' }
]);
```

## Performance Considerations

- Efficient property extraction using prefix matching
- Minimal object cloning for optimal memory usage
- Batch processing for large datasets
- Early termination for null value consolidation

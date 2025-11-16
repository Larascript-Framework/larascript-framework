# Move Object To Property

A utility class for restructuring data by moving object properties into nested objects. Useful for transforming flat data structures into hierarchical ones.

## Quick Start

```typescript
import { MoveObjectToProperty } from '@larascript/utils-bundle/utils/moveObjectToPropery';

const formatter = new MoveObjectToProperty();

// Add formatting options
formatter.addOption('department_name', 'department');
formatter.addOption('department_id', 'department');

// Format data
const data = [
  {
    id: 1,
    name: 'John',
    department_name: 'Engineering',
    department_id: 100
  }
];

const formatted = formatter.format(data);
// Result:
// [{
//   id: 1,
//   name: 'John',
//   department: {
//     name: 'Engineering',
//     id: 100
//   }
// }]
```

## API Reference

### Constructor
```typescript
const formatter = new MoveObjectToProperty();
```

### Methods

#### `addOption(column: string, targetProperty: string)`
Adds a mapping rule to move a property to a target nested object.

**Parameters:**
- `column` - The source property name to move
- `targetProperty` - The target property where the value will be nested

**Example:**
```typescript
formatter.addOption('user_name', 'user');
formatter.addOption('user_email', 'user');
```

#### `format<T>(dataArray: object[], options?: MoveObjectToPropertyOptions[])`
Formats an array of objects by applying the defined property mappings.

**Parameters:**
- `dataArray` - Array of objects to format
- `options` - Optional array of mapping options (uses stored options if not provided)

**Returns:** Formatted array of objects with nested properties

**Example:**
```typescript
const result = formatter.format(data);
// or with custom options
const result = formatter.format(data, [
  { column: 'temp_name', targetProperty: 'temp' }
]);
```

#### `handleArray(dataArray: object[], options: MoveObjectToPropertyOptions[])`
Processes an array of objects with explicit options.

#### `handleItem(item: object, options: MoveObjectToPropertyOptions)`
Processes a single object with the specified mapping options.

## Usage Patterns

### Database Result Transformation
```typescript
// Flat database result
const dbResult = [
  {
    id: 1,
    name: 'John Doe',
    address_street: '123 Main St',
    address_city: 'Boston',
    address_zip: '02101'
  }
];

const formatter = new MoveObjectToProperty();
formatter.addOption('address_street', 'address');
formatter.addOption('address_city', 'address');
formatter.addOption('address_zip', 'address');

const structured = formatter.format(dbResult);
// Result: [{ id: 1, name: 'John Doe', address: { street: '123 Main St', city: 'Boston', zip: '02101' } }]
```

### API Response Restructuring
```typescript
// API response with nested data
const apiResponse = [
  {
    product_id: 1,
    product_name: 'Widget',
    category_id: 5,
    category_name: 'Electronics'
  }
];

const formatter = new MoveObjectToProperty();
formatter.addOption('product_id', 'product');
formatter.addOption('product_name', 'product');
formatter.addOption('category_id', 'category');
formatter.addOption('category_name', 'category');

const restructured = formatter.format(apiResponse);
```

### Inline Options
```typescript
const data = [{ user_name: 'John', user_email: 'john@example.com' }];

const result = new MoveObjectToProperty().format(data, [
  { column: 'user_name', targetProperty: 'user' },
  { column: 'user_email', targetProperty: 'user' }
]);
```

## Key Features

- **Object Preservation**: Only moves properties that exist and are objects
- **Flexible Mapping**: Supports custom property name mappings
- **Batch Processing**: Efficiently processes arrays of objects
- **Type Safety**: Full TypeScript support with generic return types
- **Extensible**: Extends BaseFormatter for consistent API patterns

## Error Handling

The utility safely handles missing properties and non-object values:

```typescript
const data = [{ name: 'John', department_name: 'Engineering' }];
const formatter = new MoveObjectToProperty();
formatter.addOption('department_name', 'department');

// Missing properties are ignored
formatter.addOption('non_existent', 'target');

const result = formatter.format(data);
// Only existing properties are moved
```

## Performance Considerations

- Processes only defined properties in object casting
- Efficient object cloning and property manipulation
- Minimal memory overhead for large datasets

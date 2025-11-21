# Cast Js

A TypeScript utility library for casting objects and primitives with flexible type support.

## Features

- **Type-safe casting** for JavaScript primitives and complex types
- **Object property casting** with declarative type definitions
- **Exception handling** with customizable error behavior
- **Extensible architecture** for custom cast types
> **Looking for more details?**  
See the [detailed Casts guide](./docs/casts.md) for advanced usage, API, and examples.

## Installation

```bash
npm install ben-shepherd/cast-js
```

## Quick Start

```typescript
import { castObject } from '@ben-shepherd/cast-js';

// Define your cast types
const casts = {
  id: 'number',
  name: 'string',
  isActive: 'boolean',
  createdAt: 'date'
};

// Cast your data
const user = castObject({
  id: '123',
  name: 'John Doe',
  isActive: 'true',
  createdAt: '2024-01-01'
}, casts);

// Result: { id: 123, name: 'John Doe', isActive: true, createdAt: Date }
```

## Supported Types

- `string`, `number`, `boolean`
- `array`, `object`, `date`
- `integer`, `float`, `bigint`
- `map`, `set`, `symbol`
- `null`, `undefined`

## License

ISC

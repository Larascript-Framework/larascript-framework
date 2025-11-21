# Larascript Utils

A comprehensive TypeScript utility library providing essential tools for common programming tasks in the Larascript Framework ecosystem.

## Installation

```bash
npm install ben-shepherd/larascript-utils
```

## Documentation

### [Casts Module](./docs/casts.md)
A powerful type casting system that safely converts data between different types with comprehensive error handling. Supports primitive types, complex objects, arrays, and custom casting rules. Perfect for API data validation, form processing, and data transformation workflows.

### [Compose Module](./docs/compose.md)
A utility function for implementing the mixin pattern in TypeScript, allowing you to compose classes with multiple behaviors by combining a base class with one or more mixin functions. Ideal for feature composition, plugin systems, and code reuse without deep inheritance hierarchies.

### [Dot Notation Module](./docs/dotNotation.md)
Advanced data extraction system for accessing nested object properties using intuitive dot notation. Features array indexing, wildcard processing, and deep nesting support. Ideal for configuration management, data querying, and object property manipulation.

### [Move Object To Property Module](./docs/moveObjectToProperty.md)
Utility class for restructuring data by moving object properties into nested objects. Perfect for transforming flat data structures into hierarchical ones, especially useful for database result transformation and API response restructuring.

### [Prefixed Property Grouper Module](./docs/prefixedPropertyGrouper.md)
Advanced utility for grouping object properties with common prefixes into nested objects. Ideal for processing flattened database results, API responses, and any data with prefixed property names.

### [TypeScript Utilities](./docs/typescript-utilities.md)
Collection of TypeScript utility types that enhance type safety and improve developer experience. Includes `TPrettify` for cleaner type hints and better IDE support.

## Utilities

### Error Handling
- **`captureError`** - Wraps async functions with error handling, allowing custom error callbacks while preserving the original error
- **`returnOrThrow`** - Conditionally returns a value or throws an error based on configuration

### Data Validation & Processing
- **`isUuid`** - Validates if a value is a valid UUID v4 format
- **`validateUuid`** - Throws an error if a UUID is invalid
- **`parseBooleanFromString`** - Safely parses boolean values from strings with fallback defaults
- **`forceString`** - Converts any value to a string representation

### Data Transformation
- **`deepClone`** - Creates deep copies of objects using Lodash
- **`moveObjectToProperty`** - Restructures data by moving properties into nested objects
- **`prefixedPropertyGrouper`** - Groups object properties with common prefixes into nested objects

### String Utilities
- **`Str.plural`** - Adds 's' suffix to strings if not already plural
- **`Str.snakeCase`** - Converts strings to snake_case format
- **`Str.camelCase`** - Converts strings to camelCase format
- **`Str.startLowerCase`** - Makes first character lowercase
- **`Str.startWithUppercase`** - Makes first character uppercase
- **`Str.convertToSafeMethod`** - Converts strings to safe method names
- **`Str.convertToSafeFileName`** - Converts strings to safe file names

### UUID Generation
- **`generateUuidV4`** - Generates random UUID v4 strings

### File & System Operations
- **`checksumFile`** - Calculates file checksums using specified algorithms (default: SHA256)
- **`replaceEnvValue`** - Updates environment variable values in .env file content

### Performance & Timing
- **`minExecTime`** - Ensures functions run for a minimum duration (useful for rate limiting)
- **`sleepMs`** - Promisified setTimeout for async delays

### Debugging & Development
- **`prettifyStack`** - Formats error stack traces by trimming whitespace

### TypeScript Utilities
- **`TPrettify<T>`** - Utility type that provides cleaner type hints for complex TypeScript types by expanding nested types and removing intersection artifacts

## Contributing

This package is part of the Larascript Framework ecosystem. For contribution guidelines and development setup, please refer to the main Larascript repository.

## License

ISC License - see [LICENSE](LICENSE) for details.
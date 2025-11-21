# Compose Module

A utility function for implementing the mixin pattern in TypeScript, allowing you to compose classes with multiple behaviors by combining a base class with one or more mixin functions.

## Usage

```typescript
import { compose } from '@ben-shepherd/larascript-utils';

// Define mixin functions
const LoggableMixin = (BaseClass) => class extends BaseClass {
  log(message: string) {
    console.log(`[${this.constructor.name}] ${message}`);
  }
};

const TimestampMixin = (BaseClass) => class extends BaseClass {
  getTimestamp() {
    return new Date();
  }
};

// Base class
class User {
  constructor(public name: string) {}
  
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}

// Compose the class with mixins
const EnhancedUser = compose(User, LoggableMixin, TimestampMixin);

// Use the composed class
const user = new EnhancedUser('John');
console.log(user.greet()); // "Hello, John!"
user.log('User created'); // "[EnhancedUser] User created"
console.log(user.getTimestamp()); // Current date/time
```

## TypeScript Safety

For proper TypeScript type checking when extending composed classes, you should declare the mixin methods in your consuming class:

```typescript
class MyService extends compose(User, LoggableMixin, TimestampMixin) {
  /**
   * Declare LoggableMixin methods for TypeScript safety.
   */
  declare log: (message: string) => void;

  /**
   * Declare TimestampMixin methods for TypeScript safety.
   */
  declare getTimestamp: () => Date;

  constructor(name: string) {
    super(name);
  }
}
```

## API

### `compose(BaseClass, ...mixins)`

Combines a base class with multiple mixin functions to create a new class that inherits from all of them.

**Parameters:**
- `BaseClass` - The base class constructor to extend
- `...mixins` - Variable number of mixin functions to apply

**Returns:**
- A new class constructor that extends the base class with all mixin behaviors

**Type:**
```typescript
(BaseClass: TClassConstructor, ...mixins: Array<(BaseClass: TClassConstructor) => TClassConstructor>) => TClassConstructor
```

## Use Cases

- **Feature Composition**: Add multiple behaviors to a base class without deep inheritance hierarchies
- **Plugin Systems**: Dynamically compose classes with different feature sets
- **Code Reuse**: Share common functionality across different class hierarchies
- **Testing**: Easily mock or replace behaviors by swapping mixins

## Notes

- Mixins are applied in the order they are provided
- Each mixin function should return a class that extends the provided base class
- The resulting class maintains proper TypeScript type safety
- **Important**: When extending composed classes, use `declare` statements to ensure TypeScript recognizes mixin methods

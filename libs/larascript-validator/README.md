# Larascript Validator

A powerful, flexible validation library for the Larascript Framework with support for custom rules, nested data validation, and comprehensive error handling.

## Features

- **Type-safe validation** with TypeScript support
- **Nested data validation** using dot notation
- **Extensible rule system** with 20+ built-in rules
- **Custom error messages** for all validation rules
- **Async validation** support
- **Comprehensive error handling** with detailed feedback

## Installation

```bash
npm install ben-shepherd/larascript-validator
```

## Quick Start

```typescript
import { Validator, RequiredRule, StringRule, EmailRule } from '@ben-shepherd/larascript-validator';

// Create a validator with rules
const validator = Validator.make({
  name: [new RequiredRule(), new StringRule()],
  email: [new RequiredRule(), new EmailRule()],
  age: [new RequiredRule(), new NumberRule()],
});

// Validate data
const result = await validator.validate({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});

if (result.passes()) {
  console.log('Validation passed:', result.validated());
} else {
  console.log('Validation failed:', result.errors());
}
```

## Basic Usage

### Creating a Validator

```typescript
// Using the static make method (recommended)
const validator = Validator.make(rules, customMessages);

// Using the constructor
const validator = new Validator(rules, customMessages);
```

### Defining Validation Rules

```typescript
const rules = {
  // Simple field validation
  name: [new RequiredRule(), new StringRule()],
  email: [new RequiredRule(), new EmailRule()],
  
  // Nested object validation
  'user.name': [new RequiredRule(), new StringRule()],
  'user.email': [new RequiredRule(), new EmailRule()],
  
  // Array validation
  'users.*.name': [new RequiredRule(), new StringRule()],
  'users.*.age': [new RequiredRule(), new NumberRule()],
};
```

### Custom Error Messages

```typescript
const messages = {
  'name.required': 'The name field is required.',
  'email.email': 'Please provide a valid email address.',
  'age.number': 'Age must be a number.',
};

const validator = Validator.make(rules, messages);
```

## Available Validation Rules

### Basic Rules
- `RequiredRule` - Field must be present and not empty
- `StringRule` - Field must be a string
- `NumberRule` - Field must be a number
- `BooleanRule` - Field must be a boolean
- `ArrayRule` - Field must be an array
- `ObjectRule` - Field must be an object

### Data Type Rules
- `DateRule` - Field must be a valid date
- `EmailRule` - Field must be a valid email address
- `UuidRule` - Field must be a valid UUID
- `JsonRule` - Field must be valid JSON
- `NumericRule` - Field must be numeric (string or number)

### Comparison Rules
- `MinRule` - Field must be greater than or equal to minimum value
- `MaxRule` - Field must be less than or equal to maximum value
- `SizeRule` - Field must have exact size (length, count, etc.)
- `EqualsRule` - Field must equal specified value
- `SameRule` - Field must match another field's value

### Conditional Rules
- `AcceptedRule` - Field must be accepted (true, "true", 1, "1", "yes", "on")
- `AcceptedIfRule` - Field must be accepted if condition is met
- `NullableRule` - Field can be null or undefined
- `AfterDateRule` - Field must be a date after specified date

### Special Rules
- `EnumRule` - Field must be one of specified values
- `RegexRule` - Field must match regular expression pattern
- `CustomRule` - Custom validation logic

## Nested Data Validation

The validator supports deep nested object validation using dot notation:

```typescript
const data = {
  user: {
    profile: {
      name: "John Doe",
      contact: {
        email: "john@example.com",
        phone: "123-456-7890"
      }
    }
  }
};

const rules = {
  'user.profile.name': [new RequiredRule(), new StringRule()],
  'user.profile.contact.email': [new RequiredRule(), new EmailRule()],
  'user.profile.contact.phone': [new RequiredRule(), new StringRule()],
};
```

## Array Validation

Validate arrays and their elements:

```typescript
const data = {
  users: [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ]
};

const rules = {
  'users': [new RequiredRule(), new ArrayRule()],
  'users.*.name': [new RequiredRule(), new StringRule()],
  'users.*.age': [new RequiredRule(), new NumberRule()],
};
```

## Validation Results

The validator returns a result object with useful methods:

```typescript
const result = await validator.validate(data);

// Check if validation passed
if (result.passes()) {
  // Get validated data (only fields that passed validation)
  const validData = result.validated();
}

// Check if validation failed
if (result.fails()) {
  // Get all validation errors
  const errors = result.errors();
  // Format: { fieldName: ['error message 1', 'error message 2'] }
}
```

## Custom Validation Rules

Create custom validation rules by extending the `AbstractRule` class:

```typescript
import { AbstractRule } from '@ben-shepherd/larascript-validator';

class CustomRule extends AbstractRule {
  async validate(value: unknown): Promise<boolean> {
    // Your custom validation logic
    return true; // or false
  }

  getMessage(): string {
    return 'Custom validation failed';
  }
}
```

## Error Handling

The validator provides comprehensive error handling:

```typescript
try {
  const result = await validator.validate(data);
  // Handle result
} catch (error) {
  if (error instanceof ValidatorException) {
    console.error('Validation error:', error.message);
  }
}
```

## API Reference

### Validator Class

- `Validator.make(rules, messages?)` - Create a new validator instance
- `validate(data)` - Validate data against rules
- `passes()` - Check if validation passed
- `fails()` - Check if validation failed
- `errors()` - Get validation errors
- `validated()` - Get validated data
- `setRuleContext(context)` - Set additional context for rules

### Validation Result

- `passes()` - Returns true if validation passed
- `fails()` - Returns true if validation failed
- `errors()` - Returns validation errors object
- `validated()` - Returns successfully validated data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

ISC License
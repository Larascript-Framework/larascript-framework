# Async Session

A lightweight async session management utility for Node.js applications using AsyncLocalStorage.

## Features

- **Async Context Management**: Maintain session state across asynchronous operations
- **Type-Safe**: Full TypeScript support with generic session data types
- **Simple API**: Easy-to-use session management without explicit context passing

## Installation

```bash
npm install ben-shepherd/async-session
```

## Quick Start

```typescript
  import AsyncSessionService from '@ben-shepherd/async-session';
  
  const session = new AsyncSessionService();
  
  await session.run({ userId: '123', role: 'admin' }, async () => {
    console.log(session.get('userId')); // '123'
    console.log(session.get('role'));   // 'admin'
  
    // Any async call here still has access to the same session data
    await someAsyncTask();
  });
```

## API

### Core Methods

- `runWithSession<T, R>(callback, data?)` - Execute code within session context
- `getSessionData<T>()` - Get current session data
- `setSessionData<T>(data)` - Replace session data
- `updateSessionData<T>(data)` - Merge new data with existing session data
- `getSessionId()` - Get current session ID

### Session Data Types

```typescript
type TSessionData = Record<string, unknown>;

interface TSessionObject<T extends TSessionData = TSessionData> {
  id: string;
  data: T;
}
```

## Use Cases

- **Request Context**: Maintain user context across async operations
- **Transaction Tracking**: Track transaction IDs through complex workflows
- **Debugging**: Attach debug information to async execution chains
- **State Management**: Share state without prop drilling

## Development

```bash
npm install
npm test
npm run build
```

## License

ISC

# AsyncLocalStorage

The Larascript HTTP package supports using Node.js's [`async_hooks`](https://nodejs.org/api/async_context.html#class-asynclocalstorage) to provide true per-request context isolation, even across asynchronous boundaries. This is an alternative to the default in-memory request context, and is especially useful for advanced scenarios such as:

- **Storing request-scoped data** that needs to be accessible anywhere in the call stack, including in services, database hooks, or background jobs triggered by the request.
- **Correlating logs or traces** with the current request.
- **Avoiding accidental data leaks** between concurrent requests in asynchronous code.

## How it Works

When enabled, the framework wraps each incoming HTTP request in an `AsyncLocalStorage` context. Any data stored in this context is automatically available to all code running as part of the same request, regardless of how deep the async call stack goes.

The `RequestContext` service will transparently use `AsyncLocalStorage` if it is enabled in your configuration.

## Enabling AsyncLocalStorage

You do not need to do anything to enable it. It is enabled by default per request.

(Reference: [StartSessionMiddleware](../src/http/middleware/StartSessionMiddleware.ts))

## Accessing the AsyncLocalStorage context

You can use `HttpEnvironment` to get the current session data:

```ts
const session = HttpEnvironment.getInstance().asyncSession.getSession();

session.test = 'test'; 

console.log(session);
```


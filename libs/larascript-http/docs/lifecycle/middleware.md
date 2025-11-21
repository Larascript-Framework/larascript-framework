## Middleware

Apply middleware globally, per group, or per route. Middlewares can be Express handlers or classes extending `Middleware`.

```ts
import Middleware from '@/http/base/Middleware';

class AuthMiddleware extends Middleware {
  async execute(ctx) {
    // ... auth checks
    this.next();
  }
}

router.group({ prefix: '/api', middlewares: [AuthMiddleware] }, (r) => {
  r.get('/me', MeController);
});

r.post('/upload', UploadController, {
  middlewares: [AuthMiddleware]
});
```

Order of execution:
1. Global before-all middlewares (config.beforeAllMiddlewares)
2. Group/route middlewares
3. Global after-all middlewares (config.afterAllMiddlewares)
4. Route handler

Notes:
- Middlewares can be Express handlers `(req, res, next)` or classes extending `Middleware` with `execute(ctx)`.
- You can attach middlewares at the group level via `router.group({ middlewares: [...] }, cb)`.


## Sample Middleware

Here's an example of a custom middleware that logs the request method and URL:

```ts

class LoggerMiddleware extends Middleware {
  async execute(context: HttpContext) {
    console.log(`${context.getRequest().method}: ${context.getRequest().url}`);
    this.next();
  }
}
```

**Important:** Always call `this.next()` to continue the middleware chain. Without calling `this.next()`, the request will hang and the response will not be sent.
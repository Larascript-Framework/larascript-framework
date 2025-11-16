## Routes

Define routes with the router or the `HttpRouter` facade.

```ts
import HttpRouter from '@/http/router/HttpRouter';
import Route from '@/http/router/Route';
import UsersController from '@/http/controllers/UsersController';

const router = new HttpRouter();

// Basic routes
router.get('/health', UsersController );
router.post('/users', UsersController );

// Grouped routes (prefix, shared middleware, security, etc.)
router.group({ prefix: '/api', middlewares: [] }, (r) => {
  r.get('/users', UsersController );
  r.get('/users/:id', UsersController );
});

// Using a specific controller method
router.get('/users', [UsersController, 'users'] );

// Use an express function
router.get('/users', (req, res) => {
  res.send('Hello World');
});

// Individual options per route
router.get('/users', UsersController, {
  middlewares: [
    AuthenticationMiddleware,
  ],
  security: [
    router.security().rateLimited(100, 1),
  ]
});
```

### Options
- **name**: route name
- **prefix**: path prefix (also available via `group`)
- **middlewares**: function/class middlewares
- **controller**: controller class for `'action'` methods
- **security**: array of security rules
- **validator**: request validator(s)
- **config**: arbitrary per-route config

HTTP methods available: `get`, `post`, `put`, `patch`, `delete`.

Notes:
- `router.group` merges `middlewares` and `security` from the group into child routes.
- You can pass controllers as a class, a tuple `[Controller, 'method']`, or an Express handler.



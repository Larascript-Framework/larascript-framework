## Registering Routes

Once you have defined your routes, you need to register them with the HTTP service.

```ts
// routes/api.ts
import { HttpRouter } from '@larascript-framework/larascript-http';

export const apiRouter = new HttpRouter().group(router => {
    router.get('/', HelloWorldController);
});
```

The routes must be registered **before** the HttpEnvironment is booted.

```ts
import { apiRouter } from './routes/api.js';

HttpEnvironment.create({ /* environment config */ })

HttpEnvironment.getInstance().httpService.useRouter(apiRouter);

await HttpEnvironment.create(
    new HttpService({ /* http service config */ })
).boot();
```

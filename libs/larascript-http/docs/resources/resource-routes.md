## Resource routes

Generate RESTful CRUD endpoints with one call. Routes map to `ResourceController` methods.

```ts
import HttpRouter from '@/http/router/HttpRouter';
import Route from '@/http/router/Route';

const router = new HttpRouter();

router.resource({
  prefix: '/posts',
  datasource: {
    modelConstructor: PostModel,
  }, // Alternatively, you can provide 'repository' with your own implementation 
  middlewares: [],
  security: [router.security().resourceOwner('userId')],
  scopes: {
    index: ['posts.read'],
    create: ['posts.write']
  },
  searching: { fields: ['title', 'body'] },
  paginate: { pageSize: 20, allowPageSizeOverride: true },
  sorting: { defaultField: 'createdAt', defaultDirection: 'desc' },
  validation: { create: CreatePostValidator, update: UpdatePostValidator },
  only: ['index', 'show', 'create', 'update', 'delete']
});
```

Generated routes:
- `GET /` → index (Lists all resources)
- `GET /:id` → show (Shows a single resource)
- `POST /` → create (Creates a new resource)
- `PUT /:id` → update (Updates a single resource)
- `DELETE /:id` → delete (Deletes a single resource)

Notes:
- `security` and `middlewares` merge with any parent group.
- `scopes` are combined per action type.
- `only` limits which endpoints are created.
- `datasource.modelConstructor` will only be available if the `Database` service is available. Otherwise, you should provide your own implementation of the `datasource.repository` property.



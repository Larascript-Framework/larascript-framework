## Security

Attach security rules to routes. Security is enforced by `SecurityMiddleware` and applied automatically when `security` is non-empty.

```ts
const router = new HttpRouter();

router.post('/posts', [PostsController, 'create'], {
  security: [
    router.security().hasRole(['admin', 'editor']),
    router.security().scopes('posts.write'),
    router.security().rateLimited(100, 1)
  ]
});

router.resource({
  prefix: '/posts',
  datasource: PostRepository,
  security: [router.security().resourceOwner('userId')]
});
```

Available rules:
- `hasRole(roles)` - Check if the user has any of the given roles. (`Database`, `Auth` services are required)
- `scopes(scopes, exactMatch = true)` - Check if the user has any of the given scopes. (`Database`, `Auth` services are required)
- `resourceOwner(attribute = 'userId')` - Check if the user is the owner of the resource.
- `rateLimited(limit, perMinuteAmount)` - Rate limit the request. 

Security from parent groups is merged with child routes. Rules can be found and evaluated per action type during resource routing.

Testing behavior (from `security.test.ts`):
- Unauthenticated requests to secured routes return 401 with `{ error: 'Unauthorized' }`.
- `rateLimited(1, 60)` returns 429 on the second request in a minute.
- `hasRole('admin')` returns 200 when `context.getUser().getAclRoles()` includes `'admin'`, otherwise 403 with `{ error: 'User does not have the required roles' }`.



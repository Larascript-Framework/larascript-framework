# Testing Tips

- **Async tests**: Prefer `--runInBand` for suites that touch databases, sockets, or HTTP servers to avoid race conditions.
- **Per-package scripts**: Packages commonly expose `test`, `test:watch`, and `test:coverage`. Run from the package directory or use your workspace tool to run across the monorepo.

## Monorepo Wide Testing

```bash
turbo test --concurrency=1
```

## Library Wide Testing

```bash
turbo run test --concurrency=1 --filter="./libs/*"
```

## Recommended scripts (package-level)

```json
{
  "scripts": {
    "test": "jest --runInBand --passWithNoTests",
    "test:watch": "jest --runInBand --watch --passWithNoTests",
    "test:coverage": "jest --runInBand --coverage --passWithNoTests"
  }
}
```

For HTTP/database-heavy suites (example from `@larascript-framework/larascript-http`), start Dockerized DBs first:

```json
{
  "scripts": {
    "test": "npm run db:postgres:restart && jest --runInBand --detectOpenHandles --passWithNoTests && npm run db:postgres:down",
    "test:nodb": "jest --runInBand --detectOpenHandles --passWithNoTests",
    "test:watch": "jest --runInBand --watch --detectOpenHandles --passWithNoTests",
    "test:coverage": "jest --runInBand --coverage --detectOpenHandles --passWithNoTests",
    "db:postgres:restart": "npm run db:postgres:down && npm run db:postgres:up",
    "db:postgres:down": "cd ./docker && docker-compose -f ../../test-database/docker/docker-compose.postgres.yml down -v",
    "db:postgres:up": "cd ./docker && docker-compose -f ../../test-database/docker/docker-compose.postgres.yml up -d"
  }
}
```

If Docker is already running, use `test:nodb` to reduce startup time.

## Running a single test

```bash
# By file name or path pattern
pnpm test -- --testPathPattern="repository.test.ts"

# By test name pattern
pnpm test -- -t "should create a resource"
```

## Database-backed tests

At the start of DB suites, boot a testing environment once per file:

```typescript
beforeAll(async () => {
  await testHelper.testBootApp();
});
```

For lower-level database integration, you can also use the shared environment:

```typescript
import { TestDatabaseEnvironment } from "@larascript-framework/test-database";

await TestDatabaseEnvironment.create().boot();
```

See also: database-specific guidance in `database-testing.md` and HTTP testing in `http-testing.md`.

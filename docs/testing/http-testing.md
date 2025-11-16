## HTTP Testing

Use the `TestHttpEnvironment` helper to boot an isolated HTTP + Auth + DB environment for tests. This provides `HttpEnvironment` and a preconfigured `HttpService` using test configuration.

### Boot per test file

```typescript
import { HttpEnvironment } from "@/http/environment/index.js";
import HttpService from "@/http/services/HttpService.js";
import { TestHttpEnvironment } from "@/tests/helpers/TestHttpEnvironment.js";

let httpService: HttpService;

beforeEach(async () => {
  await TestHttpEnvironment.create().boot();
  httpService = HttpEnvironment.getInstance().httpService as HttpService;
});
```

The helper performs the following:
- Boots the Database environment (tables dropped/recreated for test runs)
- Initializes Validator services with the database/query builder
- Boots the Auth environment with test JWT secrets and ACL
- Boots the HTTP environment with `testConfig`

### Repository-style resource tests

Create a repository and exercise CRUD, filters, sorting, and pagination:

```typescript
import { DatabaseResourceRepository } from "@/http/resources/repository/DatabaseResourceRepository.js";
import { MockModel } from "./repository/MockModel.js";
import { resetMockModelTable } from "./repository/resetMockModelTable.js";

let repository: DatabaseResourceRepository;

beforeEach(async () => {
  await TestHttpEnvironment.create().boot();
  repository = new DatabaseResourceRepository({ modelConstructor: MockModel });
  await resetMockModelTable();
});

test("create resource", async () => {
  const resource = await repository.createResource({ name: "Test", age: 20 });
  expect(resource.name).toBe("Test");
});

test("list with sort", async () => {
  const resources = await repository.getResources({}, [{ field: "age", sortDirection: "asc" }]);
  expect(resources.length).toBeGreaterThan(0);
});
```

### Notes

- Prefer `beforeEach` if each test mutates HTTP/database state, combined with fast table reset helpers.
- For suites that only read, `beforeAll` may be sufficient.
- Run in-band for stability: `jest --runInBand`.



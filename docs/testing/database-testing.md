## Database Testing

When tests use database connections, run them serially and boot a shared testing kernel once per file.

### Booting the database for tests

Most database suites call a helper that boots providers with `EnvironmentTesting`:

```typescript
// Example from database tests
import { testHelper } from "@/tests/tests-helper/testHelper.js";

beforeAll(async () => {
  await testHelper.testBootApp();
});
```

The helper configures the database and query builder singletons. Use `beforeAll`/`afterAll` to minimize reboots.

### Running in-band

```bash
pnpm test -- --runInBand
# or
jest --runInBand
```

If needed, limit workers: `jest --maxWorkers=1`.

### Migrations in tests

For suites that exercise migrations, set the migration directory and run commands explicitly:

```typescript
import MigrateUpCommand from "@/migrations/commands/MigrateUpCommand.js";
import MigrateDownCommand from "@/migrations/commands/MigrateDownCommand.js";
import path from "path";
import { DB } from "@larascript-framework/larascript-database";

let up: MigrateUpCommand;
let down: MigrateDownCommand;

beforeAll(async () => {
  await testHelper.testBootApp();

  up = new MigrateUpCommand({
    keepProcessAlive: true,
    schemaMigrationDir: path.join(process.cwd(), "src/tests/migrations/migrations"),
  });
  up.setOverwriteArg("group", "testing");
  up.setOverwriteArg("file", "test-migration");

  down = new MigrateDownCommand({
    keepProcessAlive: true,
    schemaMigrationDir: path.join(process.cwd(), "src/tests/migrations/migrations"),
  });
  down.setOverwriteArg("group", "testing");
  down.setOverwriteArg("file", "test-migration");
});

test("migration up/down", async () => {
  await up.execute();
  // ...assert tables exist via DB.getInstance().databaseService().schema()
  await down.execute();
});
```

### Using the shared TestDatabaseEnvironment

For lower-level tests without the full kernel, the lightweight environment is available:

```typescript
import { TestDatabaseEnvironment } from "@larascript-framework/test-database";

await TestDatabaseEnvironment.create().boot();
```

### Best practices

- Boot once per file with `beforeAll`; avoid `beforeEach` boots.
- Clean tables you create; prefer schema helpers for setup/teardown.
- Run with `--runInBand` to avoid pool contention and singleton races.

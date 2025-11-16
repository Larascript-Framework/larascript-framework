## Test Helpers

Shared utilities for writing fast, isolated tests.

### BaseModel

Lightweight base for in-memory models with attribute handling.

```typescript
import { BaseModel, BaseModelAttributes } from "@larascript-framework/test-helpers";

interface UserAttributes extends BaseModelAttributes {
  name: string;
  email: string;
}

class User extends BaseModel<UserAttributes> {}

const user = new User({
  id: "1",
  name: "John",
  email: "john@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### BaseInMemoryRepository

Abstract repository for in-memory CRUD with sync/async methods. Ideal for unit tests.

```typescript
import { BaseInMemoryRepository } from "@larascript-framework/test-helpers";

class UserRepository extends BaseInMemoryRepository<User> {
  constructor() {
    super(User);
  }
}

const repo = new UserRepository();
const created = await repo.create({ id: "1", name: "John" } as any);
const found = await repo.findById("1");
```

### CustomSequencer

A Jest test sequencer that prioritizes tests by path fragments and optionally appends a final test. Useful for ordering expensive suites.

API excerpt:

```typescript
import { CustomSequencer } from "@larascript-framework/test-helpers";

const sequencer = new CustomSequencer();
const priorities = ["priority1", "priority2", "priority3"];

const sorted = sequencer.sort(tests, priorities, undefined);
```

Jest usage example:

```js
// jest.config.js
module.exports = {
  testSequencer: "<rootDir>/src/tests/customSequencer.js",
};
```

Where your custom wrapper can delegate to `CustomSequencer` and choose priorities.



## Jest Configuration

All packages use a shared Jest base from `@larascript-framework/jest-config`:

```js
// jest.config.js (package-level)
export { jestConfig as default } from "@larascript-framework/jest-config";
```

The base config includes:
- `ts-jest` with ESM support
- `testEnvironment: node`
- `testMatch: ["<rootDir>/src/tests/**/*.test.ts"]`
- `moduleNameMapper` for `@/` path aliases
- Coverage defaults and reporters

### Sequencing tests

If you need to control test order, use a custom sequencer. You can author a thin wrapper that leverages `CustomSequencer` from `@larascript-framework/test-helpers` and set:

```js
module.exports = {
  testSequencer: "<rootDir>/src/tests/customSequencer.js",
};
```

### Running tests

```bash
# All packages
pnpm test

# Specific package
cd libs/larascript-core && pnpm test

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

For DB/HTTP-heavy suites, run in-band: `jest --runInBand`.



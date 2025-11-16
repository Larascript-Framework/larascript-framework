# Table of Contents

- [Importing module that doesn't exist](#importing-module-that-doesnt-exist)
- [TypeError: Class extends value undefined is not a constructor or null](#typeerror-class-extends-value-undefined-is-not-a-constructor-or-null)
- [Cannot import a module that you are certain exists](#cannot-import-a-module-that-you-are-certain-exists)

## Importing module that doesn't exist

This is typically caused by a module that has been built but tsc-alias has not been run.

If required, add the `build:watch` script to the package.json and run it.

```json
"scripts": {
    "build": "tsc --skipLibCheck && npx tsc-alias",
    "build:watch": "concurrently --kill-others \"tsc -w\" \"tsc-alias -w\"",
}
```

### Error Example

```
                                                                                                       
    Configuration error:

    Could not locate module @/database/index.js mapped as:
    C:\Users\bensh\Documents\Projects\larascript\larascript-monorepo\libs\http\src\$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)\.js$/": "C:\Users\bensh\Documents\Projects\larascript\larascript-monorepo\libs\http\src\$1"
      },
      "resolver": undefined
    }

    > 1 | import { DB } from "@/database/index.js";
        | ^
      3 |  * BaseMigration class serves as the foundation for all database migrations.
      4 |  * It implements the IMigration interface and provides core functionality

      at createNoMappedModuleFoundError (../../node_modules/.pnpm/jest-resolve@30.1.3/node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (../larascript-database/dist/migrations/base/BaseMigration.js:1:1)
      at Object.<anonymous> (../larascript-database/dist/migrations/base/index.js:1:1)
      at Object.<anonymous> (../larascript-database/dist/migrations/index.js:1:1)
      at Object.<anonymous> (../larascript-database/dist/index.js:3:1)
      at Object.<anonymous> (src/tests/DatabaseResourceRepository.test.ts:5:1)

```

## TypeError: Class extends value undefined is not a constructor or null

This is typically caused by circular import dependencies.

Here is how you can find and fix them:

- Install `tslint` and `tslint-no-circular-imports`
- Add the following to your `tslint.json` file:

```json
{
    "extends": [
        "tslint-no-circular-imports"
    ]
}
```

- Add the following to your `package.json` file:

```json
"scripts": {
    "lint": "tslint --project tsconfig.json",
}
```

- Run `npm run tslint` and you should see the circular import errors.
- Try to use the concrete classes rather than classes that pull in other classes.
- Use interfaces/types rather than concrete classes where possible.

## Cannot import a module that you are certain exists

If you are trying to import something from a library in this monorepo and the import fails (e.g., "module not found" or "cannot resolve import"), but you are sure the file or export exists, try the following:

**Solution:**  

Run the following command from the root of the project:
```bash
turbo libs:build
```

You can also run the following command to build a specific library:
```bash
turbo build:watch --filter="./libs/*name-of-library" --concurrency=100%
```
# Problems with build:watch

While this command is useful for development, it can cause issues when building the project.

After awhile,  there becomes an issue where node_modules becomes corrupted. This is likely caused by doubling up on import relative paths. 

The cause is currently unknown.

## Solution

If you are using `libs:watch`, and start recieving issues with randomly, remove node_modules and run `pnpm install` again.

## Better Solution

Rather than `libs:watch`, you can either build one package at a time, or just watch the package you are working on.

**Example:**
```bash
turbo build:watch --filter="./libs/*contracts" --concurrency=21
```

## Look out for rouge imports in Git files changes

Sometimes you might notice weird imports in the Git files changes.

Example:

```
import { File } from "../../../../dist/...etc";
```

## Solution

What I find has worked is making sure you reference the direct file path to the file you are importing. (Rather than using the index.js which contain all exports)
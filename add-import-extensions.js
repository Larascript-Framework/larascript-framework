// fix-import-extensions.js
import fs from "fs";
import path from "path";

const ROOT_DIRS = [
  "apps/larascript-framework/src",
  // "libs/async-session/src",
  // "libs/cast-js/src",
  // "libs/crypto-js/src",
  // "libs/dot-notation-extractor/src",
  // "libs/larascript-acl/src",
  // "libs/larascript-auth/src",
  // "libs/larascript-collection/src",
  // "libs/larascript-console/src",
  // "libs/larascript-core/src",
  // "libs/larascript-database/src",
  // "libs/larascript-events/src",
  // "libs/larascript-logger/src",
  // "libs/larascript-mail/src",
  // "libs/larascript-observer/src",
  // "libs/larascript-storage/src",
  // "libs/larascript-utils/src",
  // "libs/larascript-validator/src",
  // "libs/larascript-views/src",
  // "libs/test-helpers/src"
];

/**
 * Recursively walk a directory and return all .ts/.tsx files.
 */
function getAllTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllTsFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Add `.js` to relative imports if missing.
 */
function fixImports(file) {
  let content = fs.readFileSync(file, "utf8");
  let updated = content
    // handle `import ... from "./foo"`
    .replace(/from\s+["'](\.\/[^"']+|\.{2}\/[^"']+)["']/g, (match, p1) => {
      if (/\.(js|ts|json|mjs|cjs|jsx|tsx)$/.test(p1)) return match;
      return `from "${p1}.js"`;
    })
    // handle `import ... from "@/foo"`
    .replace(/from\s+["']@\/([^"']+)["']/g, (match, p1) => {
      if (/\.(js|ts|json|mjs|cjs|jsx|tsx)$/.test(p1)) return match;
      return `from "@/${p1}.js"`;
    })
    // handle `export ... from "./foo"`
    .replace(/export\s+.*from\s+["'](\.\/[^"']+|\.{2}\/[^"']+)["']/g, (match, p1) => {
      if (/\.(js|ts|json|mjs|cjs|jsx|tsx)$/.test(p1)) return match;
      return match.replace(p1, `${p1}.js`);
    })
    // handle dynamic imports: import("./foo")
    .replace(/import\(\s*["'](\.\/[^"']+|\.{2}\/[^"']+)["']\s*\)/g, (match, p1) => {
      if (/\.(js|ts|json|mjs|cjs|jsx|tsx)$/.test(p1)) return match;
      return `import("${p1}.js")`;
    });

  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    console.log(`✅ Fixed imports in ${file}`);
  }
}

// Run on all target directories
ROOT_DIRS.forEach((dir) => {
  const files = getAllTsFiles(path.resolve(dir));
  files.forEach(fixImports);
});

console.log("✨ Done! All relative imports now have .js extensions.");

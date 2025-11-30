const globals = require("globals");
const tseslint = require("typescript-eslint");
const { globalIgnores, defineConfig } = require("eslint/config");

module.exports = (tsconfigRootDir = process.cwd()) => defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { 
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir,
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: false,
          allowTernary: false,
          allowTaggedTemplates: false,
        },
      ],
    },
  },
  globalIgnores([
    "node_modules",
    "dist",
    "build",
    "coverage",
    "logs",
    "tmp",
    "cache",
    "storage",
    "src/tests"
  ]),
]);

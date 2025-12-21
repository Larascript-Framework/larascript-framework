const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");

module.exports = (tsconfigRootDir = process.cwd()) => [
  // Global ignores should be first
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/logs/**",
      "**/tmp/**",
      "**/cache/**",
      "**/storage/**",
      "**/src/tests/**"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { 
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      import: importPlugin,
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: false,
          allowTernary: false,
          allowTaggedTemplates: false,
        },
      ],
      "import/no-cycle": "error",
      "import/no-internal-modules": "error",
      "import/no-relative-parent-imports": "error"
    },
  },
];
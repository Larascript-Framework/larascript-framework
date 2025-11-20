import { fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import _import from "eslint-plugin-import";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("eslint:recommended"),
    {
        files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
        ignores: ["fix-imports.js", "jest.config.js", "webpack.config.js"],
        plugins: {
            import: fixupPluginRules(_import),
        },
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 2020,
            sourceType: "module",
            parser: tsParser,
            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: ".",
            },
        },
        rules: {
            "no-empty": "off",
            "no-var": "error",
            "no-unused-vars": "warn",
            "sort-imports": ["error", {
                ignoreDeclarationSort: true,
            }],
            "import/order": ["error", {
                groups: [["builtin", "external", "internal"]],
                "newlines-between": "always",
            }],
            "no-const-assign": "error",
            "prefer-const": ["error", {
                destructuring: "any",
                ignoreReadBeforeAssign: false,
            }],
            "brace-style": ["error", "stroustrup", {
                allowSingleLine: false,
            }],
            "lines-around-comment": ["error", {
                beforeBlockComment: true,
            }],
            indent: ["error", 4],
            "object-curly-newline": ["error", {
                ObjectExpression: { multiline: true, consistent: true },
                ObjectPattern: { multiline: true, consistent: true },
                ImportDeclaration: { multiline: true, consistent: true },
                ExportDeclaration: { multiline: true, consistent: true },
            }],
            "class-methods-use-this": ["off", {
                exceptMethods: [],
            }],
            "lines-between-class-members": ["error", "always", {
                exceptAfterSingleLine: false,
            }],
            "padded-blocks": ["error", { 
                classes: "always"
            }],
        },
    },
    {
        files: ["fix-imports.js", "jest.config.js", "webpack.config.js"],
        languageOptions: {
            globals: {
                ...globals.node,
                require: "readonly",
                module: "readonly",
                process: "readonly",
                console: "readonly",
            },
            ecmaVersion: 2020,
            sourceType: "module",
        },
    },
];
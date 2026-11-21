import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const tsParserOptions = {
  requireConfigFile: false,
  babelOptions: {
    presets: [
      "@babel/preset-typescript",
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
  },
};

export default [
  { ignores: ["dist", "docs", "test-results", "playwright-report", "scripts", ".tmp"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: tsParserOptions,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript (`npm run typecheck`) handles undefined symbols, JSX component usage, and type-only imports.
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "*.ts"],
    languageOptions: {
      parser: babelParser,
      parserOptions: tsParserOptions,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
];

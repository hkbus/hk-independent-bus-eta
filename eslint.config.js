import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: ["build/**", "dist/**", "src-tauri/**", "workers/**"],
  },
  js.configs.recommended,
  ...tsPlugin.configs["flat/recommended"],
  reactPlugin.configs.flat.recommended,
  {
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.es2021 },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Only the two rules the pre-upgrade plugin:react-hooks/recommended (v4) enabled --
      // v7's "recommended" bundles many new strict rules that would flag existing app
      // logic unrelated to this dependency bump.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules", "dist"],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
    extends: ["plugin:prettier/recommended", "eslint:recommended"],
    files: ["**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      eqeqeq: "error",
      "no-console": "off",
      curly: "error",
      "prettier/prettier": "error",
    },
  },
  pluginJs.configs.recommended,
];

/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.json", "./packages/*/tsconfig.json", "./apps/*/tsconfig.json"],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsdoc/recommended",
    "plugin:workspaces/recommended",
  ],
  plugins: ["eslint-plugin-jsdoc", "@typescript-eslint", "workspaces"],
  rules: {
    "jsdoc/require-jsdoc": "off",
    "jsdoc/require-param-type": "off",
    "jsdoc/require-returns-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "workspaces/require-dependency": "off",
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "none",
      },
    ],
  },
}

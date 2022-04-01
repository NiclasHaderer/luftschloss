module.exports = {
  env: {
    es6: true,
    node: true,
  },
  root: true,
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsdoc/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["eslint-plugin-jsdoc", "eslint-plugin-prefer-arrow", "@typescript-eslint"],
  rules: {
    "jsdoc/require-jsdoc": "off",
    "jsdoc/require-param-type": "off",
    "jsdoc/require-returns-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
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
    "prefer-arrow/prefer-arrow-functions": [
      "error",
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
  },
}

/* eslint-disable */
/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/* eslint-disable */
export default {
  displayName: "testing",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/packages/testing",
};

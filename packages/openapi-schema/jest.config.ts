/* eslint-disable */
/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/* eslint-disable */
export default {
  displayName: "openapi-schema",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/packages/openapi-schema",
};

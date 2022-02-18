# Running test

1. Set the base path of all source files `TS_NODE_BASEURL=./dist`
2. Register the _tsconfig-paths_ lib `-r tsconfig-paths/register`
3. Add the file you want to execute at the end `dist/tests/main.js`

**Finished:** `TS_NODE_BASEURL=./dist node -r tsconfig-paths/register dist/tests/main.js`

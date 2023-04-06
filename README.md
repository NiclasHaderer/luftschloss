# Luftschloss

Luftschloss is a simple, lightweight and dependency-free webserver in Node.js.

## Getting started

```
# Install dependencies used for building the project
yarn install

# Build all projects and apps
npx nx affected:build --all
```

## Structure of the repository

All packages are located in the `packages` folder. The `apps` folder contains all applications that are built on top of
the packages and can be viewed as a showcase of the packages.

### Packages

1. `@luftschloss/client`: A http client for Node.js
2. `@luftschloss/common`: The core package containing common functionality used by most other packages.
3. `@luftschloss/mocking`: Automatically mock your api calls.
4. `@luftschloss/openapi`: An openapi extension for the `@luftschloss/server` package. Just write your code and the
   openapi spec will be generated automatically.
5. `@luftschloss/openapi-schema`: The schema generation logic for the `@luftschloss/openapi` package.
6. `@luftschloss/proxy`: A proxy server for the `@luftschloss/server` package built on top of the `@luftschloss/client`
   package.
7. `@luftschloss/server`: The luftschloss http server
8. `@luftschloss/static`: Static file extensions for the `@luftschloss/server` package.
9. `@luftschloss/testing`: Testing utilities for the `@luftschloss/server` package. Use this to test your server without
   ever having to start it.
10. `@luftschloss/validation`: A custom validation library which can be used on the client and server side. It is used
    by the `@luftschloss/openapi` package.

## Demonstration applications

## url-shortener

The application in `apps/url-shortener` is a simple url shortener application. It uses the `@luftschloss/openapi`
package in combination
with the `@luftschloss/server` to automatically generate an openapi spec. The `@luftschloss/client` package is used to
verify that the urls which should be shortened actually exist and return a _successful_ status code.

```bash
# Start the application
npx nx serve url-shortener

# Open the openapi spec (choose one of the following)
open http://127.0.0.1:3200/docs/swagger
open http://127.0.0.1:3200/docs/stoplight
open http://127.0.0.1:3200/docs/redoc

# Run the thunderclient tests using vs-code
# Open the thunderclient application and import the thunderclient collection from the `apps/url-shortener` folder
# (make sure that you have set *Thunder-client: Save To Workspace* to `true` in your vscode settings)
code apps/url-shortener
```

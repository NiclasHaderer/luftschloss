import { luftServer } from "../core";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { testClient } from "@luftschloss/testing";
import { corsMiddleware } from "./cors.middleware";
import { Middleware } from "./middleware";
import { OutgoingHttpHeaders } from "http";
import { loggerMiddleware } from "./logger.middleware";

const getClient = (...middlewares: Middleware[]) => {
  const server = luftServer()
    .pipe(...middlewares)
    .unPipe(loggerMiddleware());
  return testClient(server, {
    url: {
      hostname: "127.0.0.1",
      port: 3000,
      protocol: "https",
    },
  });
};

const dropIrrelevantHeaders = (headers: OutgoingHttpHeaders) => {
  delete headers["content-length"];
  delete headers["content-type"];
  delete headers["transfer-encoding"];
  delete headers["date"];
  delete headers["connection"];
  delete headers["x-powered-by"];
  delete headers["x-content-type-options"];
  return headers;
};

test("CORS: should return no cors headers", async () => {
  const client = await getClient(corsMiddleware());
  const headers = await client.post({ pathname: "" }, {}).then(r => dropIrrelevantHeaders(r.headers));
  expect(headers).toStrictEqual({});
});

test("CORS: should return cors wildcard", async () => {
  const client = await getClient(corsMiddleware());

  const getHeaders = await client
    .post(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));

  expect(getHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Request-Method": "post",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });
});

test("CORS: allow all headers", async () => {
  const client = await getClient(corsMiddleware({ allowedHeaders: "ALL" }));

  const getHeaders = await client
    .post(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));

  expect(getHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Request-Method": "post",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "my-custom-header",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });
});

test("CORS: return all headers", async () => {
  const client = await getClient(corsMiddleware({ allowedHeaders: "ALL" }));

  const getHeaders = await client
    .post(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));

  expect(getHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Request-Method": "post",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "my-custom-header",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  });
});

test("CORS: return all methods", async () => {
  const client = await getClient(corsMiddleware({ allowedMethods: "ALL" }));

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Request-Method": "post",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
    "access-control-allow-methods": "TRACE, DELETE, GET, HEAD, PATCH, POST, PUT, OPTIONS",
  });
});

test("CORS: return allowed methods", async () => {
  const client = await getClient(corsMiddleware({ allowedMethods: ["GET", "DELETE"] }));

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Request-Method": "post",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
    "access-control-allow-methods": "GET, DELETE",
  });
});

test("CORS: return allowed headers", async () => {
  const client = await getClient(corsMiddleware({ allowedHeaders: ["my-custom-header", "header-2"] }));

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Allow-Headers": "my-custom-header, header-2, header-3",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "my-custom-header, header-2",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });
});

test("CORS: return allowed origin", async () => {
  const client = await getClient(corsMiddleware({ allowOrigins: ["https://google.com"] }));

  const optionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
          "Access-Control-Request-Headers": "my-custom-header",
          "Access-Control-Allow-Headers": "my-custom-header, header-2, header-3",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(optionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "https://google.com",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });
});
test("CORS: regex origin", async () => {
  const client = await getClient(corsMiddleware({ allowedOriginRegex: /https:\/\/google\.com/ }));

  const allowedOptionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(allowedOptionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "https://google.com",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });

  const rejectedOptionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://youtube.com",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(rejectedOptionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });
});

test("CORS: function origin", async () => {
  const client = await getClient(
    corsMiddleware({
      allowOrigins: ["https://youtube.com"],
      allowOriginFunction: () => true,
    })
  );

  const allowedOptionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://google.com",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(allowedOptionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "https://youtube.com, https://google.com",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });

  const rejectedOptionsHeaders = await client
    .options(
      { pathname: "" },
      {
        headers: {
          Origin: "https://youtube.com",
        },
      }
    )
    .then(r => dropIrrelevantHeaders(r.headers));
  expect(rejectedOptionsHeaders).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-origin": "https://youtube.com",
    "access-control-max-age": "600",
    "access-control-allow-methods": "*",
  });
});

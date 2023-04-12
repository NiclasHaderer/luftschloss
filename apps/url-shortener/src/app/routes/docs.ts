import { defaultRouter } from "@luftschloss/server";
import { openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi";
import { apiDefinition } from "../api-definition";

export const docsRouter = () => {
  const docsRouter = defaultRouter();
  docsRouter.mount(openApiRouter(apiDefinition));
  docsRouter.mount(stoplightRouter({ openApiUrl: "/docs/openapi" }));
  docsRouter.mount(redocRouter({ openApiUrl: "/docs/openapi" }));
  docsRouter.mount(swaggerRouter({ openApiUrl: "/docs/openapi" }));
  return docsRouter;
};

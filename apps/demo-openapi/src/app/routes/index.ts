import { apiRouter, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi";
import { CreateUrlModel, IDs, UrlModel } from "../models";
import { mockAll } from "@luftschloss/mocking";
import { nullFactory, object, string } from "@luftschloss/validation";
import { defaultRouter } from "@luftschloss/server";
import { apiDefinition } from "../api-definition";

export const shortenerRouter = (tag = "shorten") => {
  const router = apiRouter().tag(tag);

  // Create a new shortened URL
  router
    .build({
      body: CreateUrlModel,
      response: UrlModel,
    })
    .info({
      summary: "Create a new shortened URL",
      description: "Create a new shortened URL. The ID will be generated automatically.",
    })
    .post(() => mockAll(UrlModel));

  // Delete a shortened URL
  router
    .build({
      response: nullFactory(),
      path: object({
        id: string(),
      }),
    })
    .info({
      summary: "Delete a stored shortened URL",
    })
    .delete("{id:string}", () => null);

  // Update a shortened URL
  router
    .build({
      body: CreateUrlModel,
      response: UrlModel,
      path: object({
        id: string(),
      }),
    })
    .info({
      summary: "Update a stored shortened URL",
      description: "Update a stored shortened URL. The ID will stay the same.",
    })
    .put("{id:string}", () => mockAll(UrlModel));

  // Get all shortened URL IDs
  router
    .build({
      response: IDs,
    })
    .info({
      summary: "Get all shortened URL IDs",
    })
    .get(() => mockAll(IDs));

  // Get redirected to the url which belongs to the given ID
  router
    .build({
      response: nullFactory(),
    })
    .info({
      summary: "Redirect to URL",
      description: "Redirect to the URL which belongs to the given ID.",
    })
    .get("{id:string}", () => null);

  return router;
};

export const docsRouter = () => {
  const docsRouter = defaultRouter();
  docsRouter.mount(openApiRouter(apiDefinition));
  docsRouter.mount(stoplightRouter({ openApiUrl: "/docs/openapi" }));
  docsRouter.mount(redocRouter({ openApiUrl: "/docs/openapi" }));
  docsRouter.mount(swaggerRouter({ openApiUrl: "/docs/openapi" }));
  return docsRouter;
};

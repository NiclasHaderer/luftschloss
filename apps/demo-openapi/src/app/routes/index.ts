import { apiRouter, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi";
import { CreateUrlModel, IdPath, UrlModel, UrlModels } from "../models";
import { undefinedFactory } from "@luftschloss/validation";
import { defaultRouter } from "@luftschloss/server";
import { apiDefinition } from "../api-definition";
import { createUrl, deleteUrl, getAllUrls, getUrl, updateUrl } from "../platform/connectors";

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
    .post(({ body }) => createUrl(body.url));

  // Delete a shortened URL
  router
    .build({
      response: undefinedFactory(),
      path: IdPath,
    })
    .info({
      summary: "Delete a stored shortened URL",
    })
    .delete("{id:int}", async ({ path: { id } }) => {
      await deleteUrl(id);
      return undefined;
    });

  // Update a shortened URL
  router
    .build({
      body: CreateUrlModel,
      response: UrlModel,
      path: IdPath,
    })
    .info({
      summary: "Update a stored shortened URL",
      description: "Update a stored shortened URL. The ID will stay the same.",
    })
    .put("{id:int}", ({ path: { id }, body: { url } }) => updateUrl({ id, url }));

  // Get all shortened URL IDs
  router
    .build({
      response: UrlModels,
    })
    .info({
      summary: "Get all shortened URL IDs",
    })
    .get(() => getAllUrls());

  // Get redirected to the url which belongs to the given ID
  router
    .build({
      response: undefinedFactory(),
      path: IdPath,
    })
    .info({
      summary: "Redirect to URL",
      description: "Redirect to the URL which belongs to the given ID.",
    })
    .get("{id:int}", async ({ path: { id }, response }) => {
      const urlModel = await getUrl(id);
      response.redirect(urlModel.url);
      return undefined;
    });

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

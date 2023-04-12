import { apiRouter } from "@luftschloss/openapi";
import { CreateUrlModel, IdPath, UrlModel, UrlModels } from "../models";
import { createUrl, deleteAllUrls, deleteUrl, getAllUrls, getUrl, updateUrl } from "../platform/connectors";
import { undefinedFactory } from "@luftschloss/validation";
import { Status } from "@luftschloss/server";

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
      response: undefinedFactory().status(Status.HTTP_204_NO_CONTENT),
      path: IdPath,
    })
    .info({
      summary: "Delete a stored shortened URL",
    })
    .delete("{id:string}", async ({ path: { id } }) => {
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
    .put("{id:string}", ({ path: { id }, body: { url } }) => updateUrl({ id, url }));

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
      response: undefinedFactory().status(Status.HTTP_301_MOVED_PERMANENTLY),
      path: IdPath,
    })
    .info({
      summary: "Redirect to URL",
      description: "Redirect to the URL which belongs to the given ID.",
    })
    .get("{id:string}", async ({ path: { id }, response }) => {
      const urlModel = await getUrl(id);
      response.redirect(urlModel.url);
      // Set the cache control headers, so the browser does not cache the redirect indefinitely
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.header("Cache-Control", "no-cache, no-store, must-revalidate");
      // Set to the past, so the browser does not cache the redirect
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
      response.header("Expires", "0");

      return undefined;
    });

  router
    .build({
      response: undefinedFactory().status(Status.HTTP_404_NOT_FOUND),
    })
    .info({
      summary: "Delete all shortened URLs",
      description: "Delete all shortened URLs.",
    })
    .delete(async () => {
      await deleteAllUrls();
      return undefined;
    });

  return router;
};

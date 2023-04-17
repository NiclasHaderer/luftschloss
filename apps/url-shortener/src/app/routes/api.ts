import { apiRouter } from "@luftschloss/openapi";
import { CreateUrlModel, IdPath, UrlModel, UrlModels } from "../models";
import { createUrl, deleteAllUrls, deleteUrl, getAllUrlsForUser, getUrl, updateUrl } from "../platform/route-handlers";
import { undefinedFactory } from "@luftschloss/validation";
import { Status } from "@luftschloss/server";
import { JwtMiddleware } from "../middlewares/jwt.middleware";

export const shortenerRouter = (tag = "shorten") => {
  const securedRouter = apiRouter().tag(tag).pipe(new JwtMiddleware());

  // Create a new shortened URL
  securedRouter
    .build({
      body: CreateUrlModel,
      response: UrlModel,
    })
    .info({
      summary: "Create a new shortened URL",
      description: "Create a new shortened URL. The ID will be generated automatically.",
      security: [{ BearerAuth: [] }],
    })
    .post(({ body, request }) => createUrl(body.url, request.data.userId));

  // Delete a shortened URL
  securedRouter
    .build({
      response: undefinedFactory().status(Status.HTTP_204_NO_CONTENT),
      path: IdPath,
    })
    .info({
      summary: "Delete a stored shortened URL",
      security: [{ BearerAuth: [] }],
    })
    .delete("{id:string}", async ({ path: { id }, request }) => deleteUrl(id, request.data.userId));

  // Update a shortened URL
  securedRouter
    .build({
      body: CreateUrlModel,
      response: UrlModel,
      path: IdPath,
    })
    .info({
      summary: "Update a stored shortened URL",
      description: "Update a stored shortened URL. The ID will stay the same.",
      security: [{ BearerAuth: [] }],
    })
    .put("{id:string}", ({ path: { id }, body: { url }, request }) => updateUrl({ id, url }, request.data.userId));

  // Get all shortened URL IDs
  securedRouter
    .build({
      response: UrlModels,
    })
    .info({
      summary: "Get all shortened URL IDs",
      security: [{ BearerAuth: [] }],
    })
    .get(({ request }) => getAllUrlsForUser(request.data.userId));

  securedRouter
    .build({
      response: undefinedFactory(),
    })
    .info({
      summary: "Delete all shortened URLs",
      description: "Delete all shortened URLs.",
      security: [{ BearerAuth: [] }],
    })
    .delete(async ({ request }) => deleteAllUrls(request.data.userId));

  const router = apiRouter().tag(tag);

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
    });
  router.mount(securedRouter);
  return router;
};

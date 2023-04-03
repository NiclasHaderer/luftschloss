import { apiRouter } from "@luftschloss/openapi";
import "@luftschloss/openapi";
import { CreateUrlModel, IDs, UrlModel } from "../models";
import { mockAll } from "@luftschloss/mocking";

export const shortenerRouter = (tag = "shorten") => {
  const router = apiRouter().tag(tag);
  router
    .build({
      body: CreateUrlModel,
      response: UrlModel,
    })
    .post(() => mockAll(UrlModel));

  router
    .build({
      response: IDs,
    })
    .get(() => mockAll(IDs));

  router
    .build({
      response: IDs,
    })
    .get("{id:string}", () => mockAll(IDs));

  return router;
};

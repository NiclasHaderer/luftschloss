import { mockAll } from "@luftschloss/mocking";
import { apiRouter } from "@luftschloss/openapi";
import "@luftschloss/openapi";
import { array, int, object, string, union } from "@luftschloss/validation";
import { NotFound, Tag } from "../models/common";
import { Pet } from "../models/pet";
import { Status } from "@luftschloss/server";

export const petRouter = (tag = "pet") => {
  const router = apiRouter().tag(tag);

  router
    .build({
      body: Pet,
      response: Pet.status(Status.HTTP_418_IM_A_TEAPOT),
    })
    .info({ summary: "Update an existing pet" })
    .put(() => mockAll(Pet))
    .info({ summary: "Add a new pet to the store" })
    .modify({ response: Pet })
    .post(() => mockAll(Pet));

  router
    .build({ query: Pet.pick(["status"]), response: array(Pet) })
    .info({ summary: "Finds pet by status" })
    .get("/findByStatus", () => mockAll(array(Pet)))
    .info({ summary: "Finds pet by tags" })
    .modify({ query: object({ tags: Tag.get("name") }) })
    .get("/findByTags", () => mockAll(array(Pet)));

  router
    .build({ path: object({ petId: int().positive() }), response: Pet })
    .info({ summary: "Finds pet by id" })
    .modify({
      response: union([NotFound, Pet]),
    })
    .get("{petId:int}", () => mockAll(Pet));

  router
    .build({ path: object({ petId: int().positive() }), response: Pet, body: Pet.pick(["id", "status", "name"]) })
    .info({ summary: "Updates a pet in the store with form data" })
    .post("{petId:int}", () => mockAll(Pet));

  router
    .build({
      path: object({ petId: int().positive() }),
      body: Pet.pick(["id"]),
      headers: object({
        api_key: string(),
      }),
    })
    .info({ summary: "Deletes a pet" })
    .delete("{petId:int}", () => undefined);

  router
    .build({
      path: object({ petId: int().positive() }),
      body: Pet.pick(["photoUrls"]),
      response: Pet,
    })
    .info({ summary: "uploads an image" })
    .post("{petId:int}/uploadImage", () => mockAll(Pet));

  return router;
};

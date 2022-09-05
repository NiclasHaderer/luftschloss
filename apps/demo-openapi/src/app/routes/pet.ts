import { mockAll } from "@luftschloss/mocking"
import { apiRouter } from "@luftschloss/openapi"
import { array, int, object, string } from "@luftschloss/validation"
import { Tag } from "../models/common"
import { Pet } from "../models/pet"

export const petRouter = apiRouter().tag("pet")

petRouter
  .build({
    body: Pet,
    response: Pet,
  })
  .info({ summary: "Update an existing pet" })
  .put(() => mockAll(Pet))
  .info({ summary: "Add a new pet to the store" })
  .post(() => mockAll(Pet))

petRouter
  .build({ query: Pet.pick(["status"]), response: array(Pet) })
  .info({ summary: "Finds pet by status" })
  .get("/findByStatus", () => mockAll(array(Pet)))
  .info({ summary: "Finds pet by tags" })
  .modify({ query: object({ tags: Tag.get("name") }) })
  .get("/findByTags", () => mockAll(array(Pet)))

petRouter
  .build({ path: object({ petId: int().positive() }), response: Pet })
  .info({ summary: "Finds pet by id" })
  .get("{petId:int}", () => mockAll(Pet))

petRouter
  .build({ path: object({ petId: int().positive() }), response: Pet, body: Pet.pick(["id", "status", "name"]) })
  .info({ summary: "Updates a pet in the store with form data" })
  .post("{petId:int}", () => mockAll(Pet))

petRouter
  .build({
    path: object({ petId: int().positive() }),
    body: Pet.pick(["id"]),
    headers: object({
      api_key: string(),
    }),
  })
  .info({ summary: "Deletes a pet" })
  .delete("{petId:int}", () => undefined)

petRouter
  .build({
    path: object({ petId: int().positive() }),
    body: Pet.pick(["photoUrls"]),
    response: Pet,
  })
  .info({ summary: "uploads an image" })
  .post("{petId:int}/uploadImage", () => mockAll(Pet))

import { apiRouter } from "@luftschloss/openapi";
import { CreateUserModel, JWTResponse, JWKSResponse, UpdateUserModel } from "../models";
import { createUser, getJWT, getJWKS, updateUser } from "../plattform/connectors";

export const authenticateRouter = (tag = "authenticate") => {
  const router = apiRouter().tag(tag);

  // Create a new user
  router
    .build({
      body: CreateUserModel,
    })
    .info({
      summary: "",
      description: "",
    })
    .post("/users", async ({ body }) => {
      await createUser(body.username, body.password);
      return undefined;
    });

  // Update the password of a user
  router
    .build({
      body: UpdateUserModel,
    })
    .info({
      summary: "",
      description: "",
    })
    .put("/users", async ({ body }) => {
      await updateUser(body.username, body.oldPassword, body.newPassword);
      return undefined;
    });

  //
  router
    .build({
      body: CreateUserModel,
      response: JWTResponse,
    })
    .info({
      summary: "Get all shortened URL IDs",
    })
    .post("/users/login", ({ body }) => getJWT(body.username, body.password));

  //JWKS endpoint
  router
    .build({
      response: JWKSResponse,
    })
    .info({
      summary: "Get JWKS",
    })
    .get("/get-jwks", () => getJWKS());

  return router;
};

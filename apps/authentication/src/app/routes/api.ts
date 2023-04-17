import { apiRouter } from "@luftschloss/openapi";
import { CreateUser, JWKSResponse, JWTResponse, UpdatePassword } from "../models";
import { createUser, deleteUser, getJWKS, getJWT, updateUser } from "../plattform/connectors";

export const authenticateRouter = (tag = "authenticate") => {
  const router = apiRouter().tag(tag);

  // Create a new user
  router
    .build({
      body: CreateUser,
    })
    .info({
      summary: "Create a new user",
    })
    .post("/users", async ({ body }) => {
      await createUser(body.username, body.password);
    });

  router
    .build({
      body: CreateUser,
    })
    .info({
      summary: "Delete a user",
    })
    .delete("/users", async ({ body }) => {
      await deleteUser(body.username, body.password);
    });

  // Update the password of a user
  router
    .build({
      body: UpdatePassword,
    })
    .info({
      summary: "Update the password of a user",
    })
    .put("/users", async ({ body }) => {
      await updateUser(body.username, body.oldPassword, body.newPassword);
    });

  //
  router
    .build({
      body: CreateUser,
      response: JWTResponse,
    })
    .info({
      summary: "Login a user",
      description: "Login a user and return a JWT token",
    })
    .post("/users/login", async ({ body }) => ({
      token: await getJWT(body.username, body.password),
    }));

  //JWKS endpoint
  router
    .build({
      response: JWKSResponse,
    })
    .info({
      summary: "Get JWKS used for JWT validation",
    })
    .get(".well-known/jwks.json", () => getJWKS());

  return router;
};

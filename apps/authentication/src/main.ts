import { KeyPairHolder } from "./app/plattform/key";
import { createJWT } from "./app/plattform/jwt";
import crypto from "crypto";
import { apiServer } from "@luftschloss/openapi";
import { corsMiddleware } from "@luftschloss/server";
import { authenticateRouter, docsRouter } from "./app/routes";

const main = async () => {
  await new KeyPairHolder().init();
  const jwt = createJWT("test");
  console.log("valid: ", await decodeJwt(jwt));

  const server = apiServer();
  server.pipe(
    corsMiddleware({
      allowCredentials: true,
      allowedHeaders: "ALL",
      allowedMethods: "ALL",
      allowOriginFunction: () => true,
    })
  );
  server.mount(authenticateRouter(), { basePath: "/" });
  server.mount(docsRouter(), { basePath: "/docs" });
  void server.listen(3300, "0.0.0.0");
};
void main();

async function decodeJwt(jwtStr: string): Promise<boolean> {
  const jwtParts = jwtStr.split(".");
  const [header, payload, signature] = jwtParts;
  return await isSignatureValid(header, payload, signature);
}

async function isSignatureValid(header: string, payload: string, signature: string): Promise<boolean> {
  const keyPair = new KeyPairHolder();
  const key = keyPair.jwk();

  // Create the RSA public key
  const publicKey = crypto.createPublicKey({
    format: "jwk",
    key: {
      kty: key.kty,
      n: key.n,
      e: key.e,
    },
  });

  return crypto.verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, "base64"));
}

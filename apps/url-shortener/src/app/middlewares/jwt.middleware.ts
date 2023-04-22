import { AuthMiddleware, HTTPException, LRequest, ValidToken } from "@luftschloss/server";
import { Cache } from "@luftschloss/common";
import { JWKsResponse, JWT, JwtHeader, JwtPayload } from "../models";
import * as crypto from "crypto";
import { get } from "@luftschloss/client";

export class JwtMiddleware extends AuthMiddleware<JWT, string> {
  constructor(private authService: string) {
    super();
  }

  @Cache()
  public async jwksResponse(): Promise<JWKsResponse> {
    const jwksResponse = await get(`${this.authService}/.well-known/jwks.json`)
      .send()
      .then(r => r.json());
    return JWKsResponse.coerce(jwksResponse);
  }

  public async extractToken(req: LRequest): Promise<JWT> {
    if (!req.headers.has("Authorization")) throw new HTTPException(403, "No 'Authorization' header present");
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader.startsWith("Bearer ")) throw new HTTPException(403, "No Bearer token present");
    try {
      return await this.decodeJwt(authHeader.substring("Bearer ".length));
    } catch (e) {
      throw HTTPException.wrap(e, 400);
    }
  }

  public extractUserId(req: LRequest, token: JWT): Promise<string> | string {
    return token.payload.sub;
  }

  public validateToken(token: JWT): ValidToken {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return {
      isValid: token.payload.exp > currentTimestamp,
      reason: "Token expired",
    };
  }

  protected async decodeJwt(jwtStr: string): Promise<JWT> {
    const jwtParts = jwtStr.split(".");
    if (jwtParts.length !== 3) throw new HTTPException(400, "Invalid JWT format");
    const [header, payload, signature] = jwtParts;
    const decodedHeader = JwtHeader.tryParseString(true).coerce(atob(header));
    const decodedPayload = JwtPayload.tryParseString(true).coerce(atob(payload));
    const jwt = { header: decodedHeader, payload: decodedPayload };
    const isValid = await this.isSignatureValid(jwt, header, payload, signature);
    if (!isValid) {
      throw new HTTPException(400, "JWT signature invalid");
    }
    return jwt;
  }

  protected async isSignatureValid(jwt: JWT, header: string, payload: string, signature: string): Promise<boolean> {
    let jwks;
    try {
      jwks = await this.jwksResponse();
    } catch (e) {
      throw HTTPException.wrap(e, 500);
    }

    const key = jwks.keys.find(e => e.kid === jwt.header.kid && e.alg === "RS256");
    if (!key) throw new HTTPException(400, `No key found for kid ${jwt.header.kid}`);

    // Create the RSA public key
    const publicKey = crypto.createPublicKey({
      format: "jwk",
      key: {
        kty: key.kty,
        n: key.n,
        e: key.e,
      },
    });
    return crypto.verify(
      "RSA-SHA256",
      Buffer.from(`${header}.${payload}`),
      publicKey,
      Buffer.from(signature, "base64")
    );
  }
}

import { AuthMiddleware, HTTPException, LRequest, ValidToken } from "@luftschloss/server";
import { Cache } from "@luftschloss/common";
import { JWKsResponse, JWT, JwtHeader, JwtPayload } from "../models";
import { get } from "@luftschloss/client";
import * as crypto from "crypto";

export class JwtMiddleware extends AuthMiddleware<JWT, string> {
  constructor(private jwksEndpoint: string) {
    super();
  }

  @Cache()
  public jwksResponse(): JWKsResponse {
    const jwksResponse = get(this.jwksEndpoint)
      .send()
      .then(r => r.json());
    return JWKsResponse.coerce(jwksResponse);
  }

  public extractToken(req: LRequest): Promise<JWT> {
    if (!req.headers.has("Authorization")) throw new HTTPException(403, "No 'Authorization' header present");
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader.startsWith("Bearer ")) throw new HTTPException(403, "No Bearer token present");
    try {
      return this.decodeJwt(authHeader.substring("Bearer ".length));
    } catch (e) {
      throw HTTPException.wrap(e, 400);
    }
  }

  protected async decodeJwt(jwtStr: string): Promise<JWT> {
    const jwtParts = jwtStr.split(".");
    if (jwtParts.length !== 3) throw new HTTPException(400, "Invalid JWT format");
    const [header, payload, signature] = jwtParts;
    const decodedHeader = JwtHeader.tryParseString(true).coerce(header);
    const decodedPayload = JwtPayload.tryParseString(true).coerce(payload);
    const jwt = { header: decodedHeader, payload: decodedPayload };
    if (await this.isSignatureValid(jwt, header, payload, signature)) {
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

    const key = jwks.keys[jwt.header.kid];
    if (!key) throw new HTTPException(400, "No key found for kid");

    // Create the RSA public key
    const publicKey = crypto.createPublicKey({
      format: "jwk",
      key: {
        kty: key.kty,
        n: key.n,
        e: key.e,
      },
    });
    return crypto.verify(key.kty, toArrayBufferView(`${header}.${payload}`), publicKey, toArrayBufferView(signature));
  }

  public extractUserId(req: LRequest, token: JWT): Promise<string> | string {
    return token.payload.sub;
  }

  public validateToken(token: JWT): ValidToken {
    return {
      isValid: token.payload.exp < Date.now(),
      reason: "Token expired",
    };
  }
}

const toArrayBufferView = (str: string): Uint8Array => {
  return new Uint8Array(new TextEncoder().encode(str));
};

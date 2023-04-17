import { AuthMiddleware, HTTPException, LRequest, ValidToken } from "@luftschloss/server";
import { ByLazy } from "@luftschloss/common";
import { JwksResponse } from "../models/jwks";

type JWTToken = unknown;

export class JwtMiddleware extends AuthMiddleware<JWTToken, string> {
  @ByLazy<JwksResponse, JwtMiddleware>(() => {
    return null! as JwksResponse;
  })
  jwksResponse!: JwksResponse;

  extractToken(req: LRequest): Promise<JWTToken> | JWTToken {
    if (!req.headers.has("Authorization")) throw new HTTPException(403, "No 'Authorization' header present");
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader.startsWith("Bearer ")) throw new HTTPException(403, "No Bearer token present");
    return authHeader.substring("Bearer ".length);
  }

  extractUserId(req: LRequest, token: JWTToken): Promise<string> | string {
    return token as string;
  }

  validateToken(token: JWTToken): Promise<ValidToken> | ValidToken {
    return { isValid: true };
  }
}

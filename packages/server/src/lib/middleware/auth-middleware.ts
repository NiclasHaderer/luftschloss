import { Middleware, NextFunction } from "./middleware";
import { HTTPException, LRequest, LResponse } from "../core";

export type ValidToken = { isValid: true; reason?: string } | { isValid: false; reason: string };

export abstract class AuthMiddleware<TOKEN, ID extends string | number> implements Middleware {
  readonly name = "AuthMiddleware";
  readonly version = "1.0.0";

  async handle(next: NextFunction, req: LRequest<{ userId: string | number }>, res: LResponse): Promise<void> {
    const token = await this.extractToken(req);
    const { isValid, reason } = await this.validateToken(token);
    if (!isValid) throw new HTTPException(403, reason);
    req.data.userId = await this.extractUserId(req, token);

    await next(req, res);
  }

  abstract extractToken(req: LRequest): Promise<TOKEN> | TOKEN;

  abstract validateToken(token: TOKEN): Promise<ValidToken> | ValidToken;

  abstract extractUserId(req: LRequest, token: TOKEN): Promise<ID> | ID;
}

/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { InternalParsingResult, LuftType } from "./base-type";
import { ParsingContext } from "../parsing-context";
import { LuftErrorCodes } from "../validation-error";
import { deepCopy, getTypeOf } from "@luftschloss/common";

export class LuftURL extends LuftType<URL> {
  readonly supportedTypes = ["string", "URL"];

  public constructor(
    public override readonly schema: {
      protocols?: string[];
    } = {}
  ) {
    super();
  }

  public protocol(protocol: string | undefined | string[]): LuftURL {
    const newValidator = this.clone();
    newValidator.schema.protocols = protocol ? (Array.isArray(protocol) ? protocol : [protocol]) : undefined;
    return newValidator;
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<URL> {
    if (typeof data === "string") {
      try {
        data = new URL(data);
      } catch (e) {
        context.addIssue({
          code: LuftErrorCodes.PARSING_ISSUE,
          message: `Could not parse URL: ${(e as any)?.message ?? "Unknown error"}`,
          path: [...context.path],
          parser: "URL",
        });
        return {
          success: false,
        };
      }
    }
    return this._validate(data, context);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<URL> {
    if (!(data instanceof URL)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_TYPE,
        path: [...context.path],
        message: `Expected URL, got ${typeof data}`,
        expectedType: ["URL"],
        receivedType: getTypeOf(data),
      });
      return {
        success: false,
      };
    }

    if (this.schema.protocols !== undefined && !this.schema.protocols.includes(data.protocol)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_VALUE,
        path: [...context.path],
        message: `Expected protocol ${this.schema.protocols}, got ${data.protocol}`,
        allowedValues: this.schema.protocols,
        receivedValue: data.protocol,
      });
      return {
        success: false,
      };
    }

    return {
      success: true,
      data,
      usedValidator: this,
    };
  }

  clone(): LuftURL {
    return new LuftURL({ ...this.schema }).replaceValidationStorage(deepCopy(this.validationStorage));
  }
}

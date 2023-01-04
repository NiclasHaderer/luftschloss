/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers";
import { LuftErrorCodes } from "../validation-error";
import { InternalParsingResult, LuftType } from "./base-type";
import { ParsingContext } from "../parsing-context";
import { deepCopy } from "@luftschloss/common";

export class LuftString extends LuftType<string> {
  public get supportedTypes() {
    return ["string"];
  }

  constructor(
    public override readonly schema: { minLength?: number; maxLength?: number; trim: boolean } = {
      trim: false,
    }
  ) {
    super();
  }

  public clone(): LuftString {
    return new LuftString({ ...this.schema }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  public min(minLength: number | undefined): LuftString {
    const newValidator = this.clone();
    newValidator.schema.minLength = minLength;
    return newValidator;
  }

  public max(maxLength: number | undefined): LuftString {
    const newValidator = this.clone();
    newValidator.schema.maxLength = maxLength;
    return newValidator;
  }

  public trim(shouldTrim: boolean): LuftString {
    const newValidator = this.clone();
    newValidator.schema.trim = shouldTrim;
    return newValidator;
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string" && this.schema.trim) {
      data = data.trim();
    }
    return this._validate(data, context);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string") {
      if (this.schema.maxLength !== undefined && data.length > this.schema.maxLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be larger than ${this.schema.maxLength}, but it actually was ${data.length}`,
          maxLen: this.schema.maxLength,
          minLen: this.schema.minLength,
          actualLen: data.length,
        });
        return {
          success: false,
        };
      }

      if (this.schema.minLength && data.length < this.schema.minLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be smaller than ${this.schema.minLength}, but it actually was ${data.length}`,
          maxLen: this.schema.maxLength,
          minLen: this.schema.minLength,
          actualLen: data.length,
        });
        return {
          success: false,
        };
      }

      return {
        success: true,
        data: data,
        usedValidator: this,
      };
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
    return {
      success: false,
    };
  }
}

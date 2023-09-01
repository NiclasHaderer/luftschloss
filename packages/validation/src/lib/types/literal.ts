/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { CaseInsensitiveSet, deepCopy } from "@luftschloss/common";
import { ParsingContext } from "../parsing-context";
import { LuftErrorCodes } from "../validation-error";
import { InternalParsingResult, LuftType } from "./base-types";

export class LuftLiteral<T extends ReadonlyArray<string | number | boolean>> extends LuftType<T[number]> {
  private nonSensitiveSchema: CaseInsensitiveSet<T[number]>;
  private sensitiveSchema: Set<T[number]>;
  public readonly schema: { types: T; ignoreCase: boolean };

  public constructor({ types, ignoreCase = false }: { types: T; ignoreCase?: boolean }) {
    super();
    this.schema = { types, ignoreCase };
    this.nonSensitiveSchema = new CaseInsensitiveSet(this.schema.types);
    this.sensitiveSchema = new Set(this.schema.types);
  }

  public get supportedTypes() {
    return this.schema.types.map(t => t.toString());
  }

  public clone(): LuftLiteral<T> {
    return new LuftLiteral({
      ...this.schema,
      types: [...this.schema.types] as unknown as T,
    }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  public ignoreCase(ignoreCase: boolean): LuftLiteral<T> {
    const newValidator = this.clone();
    newValidator.schema.ignoreCase = ignoreCase;
    return newValidator;
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T[number]> {
    const result = this._validate(data, context);
    if (result.success && this.schema.ignoreCase) {
      return {
        success: true,
        data: this.nonSensitiveSchema.getCorresponding(data as T[number]),
        usedValidator: this,
      };
    }
    return result;
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<T[number]> {
    if (this.schema.ignoreCase) {
      if (this.nonSensitiveSchema.has(data as T[number])) {
        return {
          success: true,
          data: data as T[number],
          usedValidator: this,
        };
      }
    } else if (this.sensitiveSchema.has(data as T[number])) {
      return {
        success: true,
        data: data as T[number],
        usedValidator: this,
      };
    }

    const valueDisplay = ((data as object | undefined)?.toString?.() as string | undefined) || "unknown";
    context.addIssue({
      code: LuftErrorCodes.INVALID_VALUE,
      message: `Could not match value ${valueDisplay} to one of ${this.schema.types.join(", ")}`,
      path: [...context.path],
      allowedValues: this.supportedTypes,
      receivedValue: valueDisplay,
    });
    return {
      success: false,
    };
  }
}

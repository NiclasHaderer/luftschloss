/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers";
import { ParsingContext } from "../parsing-context";
import { InternalParsingResult } from "./base-types";
import { LuftString } from "./string";
import { deepCopy } from "@luftschloss/common";

export class LuftRegex extends LuftString {
  public override readonly schema: { regex: RegExp; minLength?: number; maxLength?: number; trim: boolean };

  public constructor({
    regex,
    minLength,
    maxLength,
    trim = false,
  }: {
    regex: RegExp;
    minLength?: number;
    maxLength?: number;
    trim?: boolean;
  }) {
    super({ trim, maxLength, minLength });
    this.schema = { regex, minLength, maxLength, trim };
  }

  public override get supportedTypes() {
    return [`/${this.schema.regex.source}/${this.schema.regex.flags}`, "string"];
  }

  public override clone(): LuftRegex {
    return new LuftRegex({
      ...this.schema,
      regex: new RegExp(this.schema.regex.source, this.schema.regex.flags),
    }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    return super._coerce(data, context);
  }

  protected override _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    const result = super._validate(data, context);
    if (!result.success) return result;

    const matches = this.schema.regex.test(result.data);
    if (matches) {
      return {
        success: true,
        data: result.data,
        usedValidator: this,
      };
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
    return {
      success: false,
    };
  }
}

/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers";
import { ParsingContext } from "../parsing-context";
import { InternalParsingResult } from "./base-types";
import { LuftNumber, LuftNumberSchema } from "./number";
import { deepCopy } from "@luftschloss/common";

type LuftIntSchema = LuftNumberSchema & {
  roundWith: "floor" | "ceil" | "trunc" | "round" | "none";
};

export class LuftInt extends LuftNumber {
  public override readonly supportedTypes = ["int"];
  public override readonly schema: LuftIntSchema;

  constructor(
    schema: LuftIntSchema = {
      min: undefined,
      max: undefined,
      allowNan: false,
      minCompare: ">=",
      maxCompare: "<=",
      roundWith: "none",
      parseString: false,
      multipleOf: undefined,
    }
  ) {
    super(schema);
    this.schema = schema;
  }

  public override clone(): LuftInt {
    return new LuftInt({ ...this.schema }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  public override parseString(parse: boolean): LuftInt {
    return super.parseString(parse) as LuftInt;
  }

  public override allowNaN(allow: boolean): LuftInt {
    return super.allowNaN(allow) as LuftInt;
  }

  public override min(number: number | undefined): LuftInt {
    return super.min(number) as LuftInt;
  }

  public override minEq(number: number | undefined): LuftInt {
    return super.minEq(number) as LuftInt;
  }

  public override max(number: number | undefined): LuftInt {
    return super.max(number) as LuftInt;
  }

  public override maxEq(number: number | undefined): LuftInt {
    return super.maxEq(number) as LuftInt;
  }

  public override positive(): LuftInt {
    return super.positive() as LuftInt;
  }

  public override nonNegative(): LuftInt {
    return super.nonNegative() as LuftInt;
  }

  public override negative(): LuftInt {
    return super.negative() as LuftInt;
  }

  public override nonPositive(): LuftInt {
    return super.nonPositive() as LuftInt;
  }

  public override multipleOf(number: number): LuftInt {
    return super.multipleOf(number) as LuftInt;
  }

  public roundWith(mode: "floor" | "ceil" | "trunc" | "round" | "none"): LuftInt {
    const newValidator = this.clone();
    newValidator.schema.roundWith = mode;
    return newValidator;
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string" && this.schema.parseString) {
      data = Number(data);
    }
    if (typeof data === "number" && data % 1 !== 0 && this.schema.roundWith !== "none") {
      data = Math[this.schema.roundWith](data);
    }

    return this._validate(data, context);
  }

  protected override _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    const result = super._validate(data, context);
    if (!result.success) return result;

    // Nan is allowed, and we do not have to make the check below
    if (isNaN(result.data)) return result;

    // Is a float number
    if (result.data % 1 !== 0) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
      return { success: false };
    }
    return result;
  }
}

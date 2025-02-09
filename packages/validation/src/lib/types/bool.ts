import { InternalParsingResult, LuftType } from "./base-types";
import { ParsingContext } from "../parsing-context";
import { createInvalidTypeIssue } from "../helpers";
import { deepCopy } from "@luftschloss/common";

export class LuftBool extends LuftType<boolean> {
  public readonly supportedTypes = ["bool"];

  constructor(public readonly schema = { parseString: false, parseNumbers: false }) {
    super();
  }

  public clone(): LuftBool {
    return new LuftBool({
      ...this.schema,
    }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  public parseString(parse: boolean): LuftBool {
    const clone = this.clone();
    clone.schema.parseString = parse;
    return clone;
  }

  public parseNumbers(parse: boolean): LuftBool {
    const clone = this.clone();
    clone.schema.parseNumbers = parse;
    return clone;
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<boolean> {
    if (this.schema.parseString && typeof data === "string") {
      const lower = data.toLowerCase();
      if (lower === "true" || lower === "false" || ((lower === "1" || lower === "0") && this.schema.parseNumbers)) {
        return {
          data: lower === "true" || lower === "1",
          success: true,
          usedValidator: this,
        };
      }
    }
    if ((this.schema.parseNumbers && data === 1) || data === 0) {
      return {
        data: data === 1,
        success: true,
        usedValidator: this,
      };
    }
    return this._validate(data, context);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<boolean> {
    if (typeof data !== "boolean") {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
      return { success: false };
    }

    return {
      data,
      success: true,
      usedValidator: this,
    };
  }
}

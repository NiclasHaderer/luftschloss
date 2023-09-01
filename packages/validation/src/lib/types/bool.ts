import { InternalParsingResult, LuftType } from "./base-types";
import { ParsingContext } from "../parsing-context";
import { createInvalidTypeIssue } from "../helpers";
import { deepCopy } from "@luftschloss/common";

export class LuftBool extends LuftType<boolean> {
  public readonly supportedTypes = ["bool"];

  constructor(public readonly schema = { parseString: false }) {
    super();
  }

  public clone(): LuftType<boolean> {
    return new LuftBool({
      ...this.schema,
    }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  public parseString(parse: boolean) {
    const clone = this.clone();
    clone.schema.parseString = parse;
    return clone;
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<boolean> {
    if (typeof data === "string") {
      const lower = data.toLowerCase();
      if (lower === "true" || lower === "false") {
        return {
          data: lower === "true",
          success: true,
          usedValidator: this,
        };
      }
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

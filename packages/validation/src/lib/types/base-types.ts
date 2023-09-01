/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ParsingContext } from "../parsing-context";
import { LuftErrorCodes, LuftValidationError, LuftValidationUsageError, ValidationError } from "../validation-error";
import { logDeprecated, returnDefault } from "./base-validation-functions";
import { deepCopy, getTypeOf, uniqueList } from "@luftschloss/common";
import { createInvalidTypeIssue } from "../helpers";

export type LuftInfer<T extends LuftType | LuftType<never>> = T extends LuftType<infer U> ? U : never;

export type InternalParsingResult<T> =
  | {
      success: true;
      data: T;
      usedValidator: LuftType;
    }
  | {
      success: false;
      data?: never;
    };

export type SuccessfulParsingResult<T> = {
  success: true;
  data: T;
  usedValidator: LuftType;
};
export type UnsuccessfulParsingResult = {
  success: false;
  issues: ValidationError[];
};

export type ParsingResult<T> = SuccessfulParsingResult<T> | UnsuccessfulParsingResult;

export interface LuftValidationStorage<RETURN_TYPE = any> {
  beforeValidateHooks: ValidationHook<any, unknown, unknown, RETURN_TYPE>[];
  beforeCoerceHooks: ValidationHook<any, unknown, unknown, RETURN_TYPE>[];
  afterValidateHooks: ValidationHook<any, RETURN_TYPE, RETURN_TYPE>[];
  afterCoerceHooks: ValidationHook<any, RETURN_TYPE, RETURN_TYPE>[];
  default:
    | {
        isSet: true;
        value: RETURN_TYPE;
      }
    | { isSet: false; value: undefined };
  deprecated: {
    isSet: boolean;
    message?: string;
  };
  description: string | undefined;
  name: string | undefined;
}

export type HookResult<CONTINUE, BREAK = CONTINUE> =
  | {
      action: "continue";
      data: CONTINUE;
    }
  | {
      action: "abort";
    }
  | {
      action: "break";
      data: BREAK;
    };

export type ValidationHook<ThisArg, VALUE, CONTINUE, BREAK = CONTINUE> = (
  this: ThisArg,
  value: VALUE,
  context: ParsingContext,
  validator: ThisArg
) => HookResult<CONTINUE, BREAK>;

export type InternalLuftBaseType<OUT_TYPE> = {
  run(data: unknown, mode: ParsingContext, skipContextValidation: boolean): ParsingResult<OUT_TYPE>;
} & Omit<LuftType<OUT_TYPE>, "run">;

export abstract class LuftType<RETURN_TYPE = any> {
  public abstract readonly schema: Record<string, unknown>;
  public abstract readonly supportedTypes: string[];

  private _validationStorage: LuftValidationStorage<RETURN_TYPE> = {
    beforeValidateHooks: [],
    beforeCoerceHooks: [],
    afterValidateHooks: [],
    afterCoerceHooks: [],
    default: { isSet: false, value: undefined },
    deprecated: {
      isSet: false,
      message: undefined,
    },
    description: undefined,
    name: undefined,
  };

  public get validationStorage(): LuftValidationStorage<RETURN_TYPE> {
    return this._validationStorage;
  }

  /**
   * @internal
   */
  public replaceValidationStorage(newValidationStorage: LuftValidationStorage<RETURN_TYPE>): this {
    this._validationStorage = newValidationStorage;
    return this;
  }

  public abstract clone(): LuftType<RETURN_TYPE>;

  public deprecated(deprecated: boolean, message?: string): this {
    const copy = this.clone();
    copy.validationStorage.deprecated = { isSet: deprecated, message };
    return copy.beforeHook(logDeprecated) as this;
  }

  public description(description: string | undefined): this {
    const copy = this.clone();
    copy.validationStorage.description = description;
    return copy as this;
  }

  public named(name: string | undefined): this {
    const copy = this.clone();
    copy.validationStorage.name = name;
    return copy as this;
  }

  public validate(data: unknown): RETURN_TYPE {
    const result = this.validateSave(data);
    if (result.success) {
      return result.data;
    }
    throw new LuftValidationError(`Could not validate data \n${result.issues.join("\n")}`, result.issues);
  }

  public validateSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext("validate");
    return this.run(data, context, false);
  }

  public coerce(data: unknown): RETURN_TYPE {
    const result = this.coerceSave(data);
    if (result.success) {
      return result.data;
    }
    throw new LuftValidationError(`Could not coerce data \n${result.issues.join("\n")}`, result.issues);
  }

  public coerceSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext("coerce");
    return this.run(data, context, false);
  }

  public optional(): LuftUnion<[this, LuftUndefined]> {
    return new LuftUnion({ types: [this.clone(), new LuftUndefined()] }) as LuftUnion<[this, LuftUndefined]>;
  }

  public nullable(): LuftUnion<[this, LuftNull]> {
    return new LuftUnion({ types: [this.clone(), new LuftNull()] }) as LuftUnion<[this, LuftNull]>;
  }

  public nullish(): LuftUnion<[this, LuftNull, LuftUndefined]> {
    return new LuftUnion({ types: [this.clone(), new LuftNull(), new LuftUndefined()] }) as LuftUnion<
      [this, LuftNull, LuftUndefined]
    >;
  }

  public or<T extends LuftType>(type: T): LuftUnion<(T | this)[]> {
    return new LuftUnion({ types: [this.clone(), type] }) as LuftUnion<(T | this)[]>;
  }

  public default(defaultValue: RETURN_TYPE): this {
    const copy = this.clone();
    copy.validationStorage.default = { isSet: true, value: defaultValue };
    return copy.beforeHook(returnDefault) as this;
  }

  public beforeHook(callback: ValidationHook<this, unknown, unknown, RETURN_TYPE>, clone = true): this {
    return this.beforeValidateHook(callback, clone).beforeCoerceHook(callback, clone);
  }

  public beforeValidateHook(callback: ValidationHook<this, unknown, unknown, RETURN_TYPE>, clone = true): this {
    const copy = clone ? this.clone() : this;
    const hasCb = copy.validationStorage.beforeValidateHooks.includes(callback);
    if (!hasCb) copy.validationStorage.beforeValidateHooks.push(callback);
    return copy as this;
  }

  public beforeCoerceHook(callback: ValidationHook<this, unknown, unknown, RETURN_TYPE>, clone = true): this {
    const copy = clone ? this.clone() : this;
    const hasCb = copy.validationStorage.beforeCoerceHooks.includes(callback);
    if (!hasCb) copy.validationStorage.beforeCoerceHooks.push(callback);
    return copy as this;
  }

  public afterHook(callback: ValidationHook<this, RETURN_TYPE, RETURN_TYPE>, clone = true): this {
    return this.afterValidateHook(callback, clone).afterCoerceHook(callback, clone);
  }

  public afterValidateHook(callback: ValidationHook<this, RETURN_TYPE, RETURN_TYPE>, clone = true): this {
    const copy = clone ? this.clone() : this;
    const hasCb = copy.validationStorage.afterValidateHooks.includes(callback);
    if (!hasCb) copy.validationStorage.afterValidateHooks.push(callback);
    return copy as this;
  }

  public afterCoerceHook(callback: ValidationHook<this, RETURN_TYPE, RETURN_TYPE>, clone = true): this {
    const copy = clone ? this.clone() : this;
    const hasCb = copy.validationStorage.afterCoerceHooks.includes(callback);
    if (!hasCb) copy.validationStorage.afterCoerceHooks.push(callback);
    return copy as this;
  }

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>;

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>;

  private run(data: unknown, context: ParsingContext, skipContextValidation: boolean): ParsingResult<RETURN_TYPE> {
    const hookAccess = ({ validate: "Validate", coerce: "Coerce" } as const)[context.mode];
    for (const beforeHook of this.validationStorage[`before${hookAccess}Hooks`]) {
      const result = beforeHook.call(this, data, context, this);

      if (result.action === "abort") {
        return this.checkDataAndReturn(context, { success: false }, skipContextValidation);
      } else if (result.action === "continue") {
        data = result.data;
      } else if (result.action === "break") {
        return this.checkDataAndReturn(
          context,
          {
            success: true,
            data: result.data,
            usedValidator: this,
          },
          skipContextValidation
        );
      }
    }

    const validationResult = this[`_${context.mode}`](data, context);
    if (!validationResult.success) return this.checkDataAndReturn(context, validationResult, skipContextValidation);

    for (const afterHook of this.validationStorage[`after${hookAccess}Hooks`]) {
      const result = afterHook.call(this, validationResult.data, context, this);
      if (result.action === "abort") {
        return this.checkDataAndReturn(context, { success: false }, skipContextValidation);
      } else if (result.action === "continue") {
        validationResult.data = result.data;
      } else if (result.action === "break") {
        return this.checkDataAndReturn(
          context,
          {
            success: true,
            data: result.data,
            usedValidator: this,
          },
          skipContextValidation
        );
      }
    }

    return this.checkDataAndReturn(context, validationResult, skipContextValidation);
  }

  private checkDataAndReturn(
    context: ParsingContext,
    resultData: InternalParsingResult<RETURN_TYPE>,
    skipContextValidation: boolean
  ): ParsingResult<RETURN_TYPE> {
    if (!skipContextValidation) {
      // Issues, but no success
      if (context.hasIssues && resultData.success) {
        throw new LuftValidationUsageError(
          "Context has issues, but the parsing result is marked as valid. Please check if your parser added issues if he returned false"
        );
      }
      // No success, but also no issues
      else if (!context.hasIssues && !resultData.success) {
        throw new LuftValidationUsageError(
          "Context does not have issues, but the parsing result is marked as valid. Please add issues if the result is not valid."
        );
      }
    }

    // Successful
    if (resultData.success) {
      return {
        success: true,
        data: resultData.data,
        usedValidator: resultData.usedValidator,
      };
    }
    // Not successful
    return {
      success: false,
      issues: context.issues,
    };
  }
}

/***********************************************************************************************************************/

export class LuftUnion<T extends ReadonlyArray<LuftType>> extends LuftType<LuftInfer<T[number]>> {
  public constructor(public readonly schema: { types: T }) {
    super();
  }

  public get supportedTypes() {
    return uniqueList(this.schema.types.flatMap(s => s.supportedTypes));
  }

  public clone(): LuftUnion<T> {
    return new LuftUnion({
      types: this.schema.types.map(type => type.clone()) as unknown as T,
    }).replaceValidationStorage(deepCopy(this.validationStorage));
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<T[number]>> {
    return this._validate(data, context, "_coerce");
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_validate" | "_coerce" = "_validate"
  ): InternalParsingResult<LuftInfer<T[number]>> {
    const validators = this.schema.types as unknown as InternalLuftBaseType<LuftInfer<T[number]>>[];
    const newErrors: ValidationError[] = [];
    for (const validator of validators) {
      const customContext = context.cloneEmpty();
      const result = validator.run(data, customContext, true);
      if (result.success) {
        return result;
      } else {
        newErrors.push(...customContext.issues);
      }
    }

    context.addIssue({
      code: LuftErrorCodes.INVALID_UNION,
      message: `Could not match to any of the available types ${this.supportedTypes.join(", ")}`,
      path: [...context.path],
      expectedType: this.supportedTypes,
      receivedType: getTypeOf(data),
      errors: newErrors,
    });

    return { success: false };
  }
}

/***********************************************************************************************************************/

export class LuftNull extends LuftType<null> {
  public supportedTypes = ["null"];
  public readonly schema = {};

  public clone(): LuftNull {
    return new LuftNull().replaceValidationStorage(deepCopy(this.validationStorage));
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<null> {
    if (data === undefined) return { success: true, data: null, usedValidator: this };
    return this._validate(data, context);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<null> {
    if (data === null) return { success: true, data, usedValidator: this };
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
    return { success: false };
  }
}

/***********************************************************************************************************************/

export class LuftUndefined extends LuftType<undefined> {
  public readonly schema = {};

  public supportedTypes = ["undefined"];

  public clone(): LuftUndefined {
    return new LuftUndefined().replaceValidationStorage(deepCopy(this.validationStorage));
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<undefined> {
    if (data === null) return { success: true, data: undefined, usedValidator: this };
    return this._validate(data, context);
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<undefined> {
    if (data === undefined) return { success: true, data, usedValidator: this };
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
    return { success: false };
  }
}

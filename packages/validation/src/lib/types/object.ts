/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy, saveObject } from "@luftschloss/common";
import { createInvalidTypeIssue } from "../helpers";
import { ParsingContext } from "../parsing-context";
import { LuftErrorCodes } from "../validation-error";
import {
  InternalLuftBaseType,
  InternalParsingResult,
  LuftInfer,
  LuftType,
  LuftUndefined,
  LuftUnion,
  LuftValidationStorage,
} from "./base-types";
import type { LuftLazy } from "./lazy";

export type InferObjectType<T extends Record<string, LuftType>> = {
  [KEY in keyof T]: T[KEY] extends LuftLazy<infer L> ? L : LuftInfer<T[KEY]>;
};

type LuftPartial<T extends Record<string, LuftType>> = {
  [KEY in keyof T]: LuftUnion<[LuftUndefined, T[KEY]]>;
};

type LuftObjectConstructor = {
  treatMissingKeyAs: "error" | "undefined";
  ignoreUnknownKeys: boolean;
  omitUndefinedKeys: boolean;
  tryParseString: boolean;
};

const getAdditionalKeys = (toManyKeys: string[], allKeys: string[]): string[] =>
  toManyKeys.filter(key => !allKeys.includes(key));

const getMissingKeys = (partialKeys: string[], allKeys: string[]): string[] =>
  allKeys.filter(key => !partialKeys.includes(key));

const copyValidatorObject = <T extends Record<string, LuftType>>(object: T): T => {
  const newObject = saveObject<Record<string, LuftType>>();
  for (const [key, value] of Object.entries(object)) {
    newObject[key] = value.clone();
  }

  return newObject as T;
};

const copyTrivialValidationStorage = (
  object: LuftValidationStorage,
  modifierStart: string,
  modifierEnd: string
): LuftValidationStorage => {
  const name = object.name ? `${modifierStart}${object.name}${modifierEnd}` : undefined;
  const description = object.description ? `${modifierStart}${object.description}${modifierEnd}` : undefined;

  return {
    afterValidateHooks: [],
    afterCoerceHooks: [],
    beforeCoerceHooks: [],
    beforeValidateHooks: [],
    default: { isSet: false, value: undefined },
    // Modified
    deprecated: object.deprecated,
    name,
    description,
  };
};

export class LuftObject<T extends Record<string, LuftType>> extends LuftType<InferObjectType<T>> {
  public readonly supportedTypes = ["object"];
  public schema: {
    type: T;
  } & LuftObjectConstructor;

  public constructor({
    treatMissingKeyAs = "undefined",
    omitUndefinedKeys = true,
    ignoreUnknownKeys = true,
    tryParseString = false,
    type,
  }: Partial<LuftObjectConstructor> & {
    type: T;
  }) {
    super();
    this.schema = {
      treatMissingKeyAs,
      omitUndefinedKeys,
      ignoreUnknownKeys,
      type,
      tryParseString,
    };
  }

  public extend<NEW_TYPE extends Record<string, LuftType>>(object: LuftObject<NEW_TYPE>): LuftObject<T & NEW_TYPE> {
    return this.merge(object.schema.type);
  }

  public merge<NEW_OBJECT extends Record<string, LuftType>>(object: NEW_OBJECT): LuftObject<T & NEW_OBJECT> {
    return new LuftObject({
      ...this.schema,
      type: {
        ...copyValidatorObject(this.schema.type),
        ...copyValidatorObject(object),
      },
    });
  }

  public omit<KEY extends keyof T & string>(keys: KEY[]): LuftObject<Omit<T, KEY>> {
    const keysToPick = getMissingKeys(keys, Object.keys(this.schema.type));
    return this.pick(keysToPick) as LuftObject<Omit<T, KEY>>;
  }

  public pick<KEY extends keyof T & string>(keys: KEY[]): LuftObject<Pick<T, KEY>> {
    const finishedObject = keys.reduce((acc, key) => {
      acc[key] = this.schema.type[key].clone();
      return acc;
    }, saveObject<Record<string, LuftType>>());

    return new LuftObject<Pick<T, KEY>>({
      ...this.schema,
      type: finishedObject as Pick<T, KEY>,
    }).replaceValidationStorage(
      copyTrivialValidationStorage(this.validationStorage, "Pick<", `${keys.map(key => `'${key}'`).join(" | ")}>`)
    );
  }

  public get<KEY extends keyof T & string>(key: KEY): T[KEY] {
    return this.schema.type[key].clone() as T[KEY];
  }

  public partial(): LuftObject<LuftPartial<T>> {
    const type = this.schema.type;
    const newType = Object.keys(this.schema.type).reduce((acc, key) => {
      acc[key] = type[key].optional();
      return acc;
    }, saveObject<Record<string, LuftType>>());

    return new LuftObject<LuftPartial<T>>({
      ...this.schema,
      type: newType as LuftPartial<T>,
    })
      .treatMissingKeyAs("undefined")
      .replaceValidationStorage(copyTrivialValidationStorage(this.validationStorage, "Partial<", ">"));
  }

  public clone(): LuftObject<T> {
    const clonedType = Object.keys(this.schema.type).reduce((acc, key) => {
      (acc as Record<string, LuftType>)[key] = this.schema.type[key].clone();
      return acc;
    }, saveObject<T>());

    return new LuftObject({ ...this.schema, type: clonedType }).replaceValidationStorage(
      deepCopy(this.validationStorage)
    );
  }

  public ignoreUnknownKeys(ignore: boolean): LuftObject<T> {
    const newValidator = this.clone();
    newValidator.schema.ignoreUnknownKeys = ignore;
    return newValidator;
  }

  public treatMissingKeyAs(treatAs: "error" | "undefined"): LuftObject<T> {
    const newValidator = this.clone();
    newValidator.schema.treatMissingKeyAs = treatAs;
    return newValidator;
  }

  public omitUndefinedKeys(omit: boolean): LuftObject<T> {
    const newValidator = this.clone();
    newValidator.schema.omitUndefinedKeys = omit;
    return newValidator;
  }

  public tryParseString(parseString: boolean): LuftObject<T> {
    const newValidator = this.clone();
    newValidator.schema.tryParseString = parseString;
    return newValidator;
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<InferObjectType<T>> {
    if (this.schema.tryParseString && typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        context.addIssue({
          code: LuftErrorCodes.PARSING_ISSUE,
          path: [...context.path],
          message: "String is not a valid json",
          parser: "json",
        });
        return { success: false };
      }
    }
    return this._validate(data, context);
  }

  protected override _validate(data: unknown, context: ParsingContext): InternalParsingResult<InferObjectType<T>> {
    // Wrong type
    if (typeof data !== "object" || data === null) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context));
      return { success: false };
    }

    // Tack if the validation should fail at the end
    let failAtEnd = false;

    // Get the keys of the data and the schema
    const dataKeys = Object.keys(data);
    const schemaKeys = Object.keys(this.schema.type);

    // Do NOT ignore unknown keys
    if (!this.schema.ignoreUnknownKeys) {
      const additionalKeys = getAdditionalKeys(dataKeys, schemaKeys);
      // If there are to many keys add the issue
      if (additionalKeys.length > 0) {
        context.addIssue({
          code: LuftErrorCodes.TO_MANY_KEYS,
          path: [...context.path],
          message: "Object keys do not match",
          additionalKeys: additionalKeys,
        });
        failAtEnd = true;
      }
    }

    // This tracks if missing keys have already been detected
    // This stops the issue being added twice
    let detectedMissingKeys = false;

    // The object for the new data
    const parsedObject = saveObject<InferObjectType<T>>();
    // Iterate over the schema
    for (const [key, validator] of Object.entries(this.schema.type)) {
      // The key is not in the data and missingKeys should be treated as error and not as undefined
      // Only step in this condition if the condition has not been executed before
      if (!(key in data) && this.schema.treatMissingKeyAs === "error" && !detectedMissingKeys) {
        // Save that the validation should fail
        failAtEnd = true;
        // Do NOT enter this condition again
        detectedMissingKeys = true;
        context.addIssue({
          code: LuftErrorCodes.MISSING_KEYS,
          path: [...context.path],
          message: "Object keys do not match",
          missingKeys: getMissingKeys(dataKeys, schemaKeys),
        });
        // Skip validation, because the key does not exist
        continue;
      }

      context.stepInto(key);
      // Validate the retrieved value
      const result = (validator as unknown as InternalLuftBaseType<unknown>).run(
        (data as Record<string, unknown>)[key],
        context,
        true
      );
      context.stepOut();

      if (result.success) {
        // Skip undefined values if the schema says so
        if (this.schema.omitUndefinedKeys && result.data === undefined) continue;

        // Save the (potentially) validated value in the new object
        (parsedObject as Record<string, unknown>)[key] = result.data;
      } else {
        failAtEnd = true;
      }
    }
    if (failAtEnd) return { success: false };

    return { success: true, data: parsedObject, usedValidator: this };
  }
}

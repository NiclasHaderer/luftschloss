import { createInvalidTypeIssue } from "../helpers";
import { LuftErrorCodes, LuftValidationError, LuftValidationUsageError, UnionError } from "../validation-error";
import {
  LuftNull,
  LuftType,
  LuftUndefined,
  LuftUnion,
  SuccessfulParsingResult,
  UnsuccessfulParsingResult,
} from "./base-type";
import { LuftString } from "./string";
import { LuftNumber } from "./number";
import { LuftObject } from "./object";

test("BaseType: undefined", () => {
  const validator = new LuftUndefined();
  expect(validator.validateSave(null).success).toBe(false);
  expect(validator.validateSave("null").success).toBe(false);
  expect(validator.validateSave({}).success).toBe(false);
  expect(validator.coerceSave({}).success).toBe(false);
  expect(validator.coerceSave(undefined).success).toBe(true);
  expect(validator.validateSave(undefined).success).toBe(true);
  expect((validator.coerceSave(undefined) as SuccessfulParsingResult<unknown>).data).toBe(undefined);
});

test("BaseType: null", () => {
  const validator = new LuftNull();
  expect(validator.validateSave(null).success).toBe(true);
  expect(validator.validateSave("null").success).toBe(false);
  expect(validator.validateSave({}).success).toBe(false);
  expect(validator.coerceSave({}).success).toBe(false);
  expect(validator.coerceSave(undefined).success).toBe(true);
  expect(validator.validateSave(undefined).success).toBe(false);
  expect((validator.coerceSave(null) as SuccessfulParsingResult<null>).data).toBe(null);
});

test("BaseType: union", () => {
  const validator = new LuftUnion({ types: [new LuftNull(), new LuftString()] });
  expect(validator.validateSave(null).success).toBe(true);
  expect(validator.validateSave("Hello world").success).toBe(true);

  class T {}

  const unsuccessfulResult = validator.validateSave(new T()) as UnsuccessfulParsingResult;
  expect(unsuccessfulResult.success).toBe(false);
  expect(unsuccessfulResult.issues.length).toBe(1);
  expect(unsuccessfulResult.issues[0].code).toBe(LuftErrorCodes.INVALID_UNION);
  expect((unsuccessfulResult.issues[0] as UnionError).expectedType).toEqual(["null", "string"]);
  expect((unsuccessfulResult.issues[0] as UnionError).receivedType).toEqual("T");
});

test("BaseType: optional, nullish, nullable", () => {
  let validator: LuftType = new LuftString();
  expect(validator.validateSave(undefined).success).toBe(false);
  validator = validator.optional();
  expect(validator.validateSave(undefined).success).toBe(true);
  expect(validator.validateSave(null).success).toBe(false);
  validator = validator.nullable();
  expect(validator.validateSave(null).success).toBe(true);
  validator = validator.nullish();
  expect(validator.validateSave(null).success).toBe(true);
  expect(validator.validateSave(undefined).success).toBe(true);
  expect(validator.validateSave("").success).toBe(true);
});

test("BaseType: default", () => {
  const validator = new LuftString();
  expect(validator.default("hello")).not.toBe(validator);
  expect(validator.default("hello").schema).toStrictEqual(validator.schema);
  expect(validator.default("hello").validationStorage).not.toBe(validator.validationStorage);
  expect(validator.default("hello").validationStorage.default.isSet).toBe(true);
  expect(validator.default("hello").validationStorage.default.value).toBe("hello");

  expect(validator.validateSave(undefined).success).toBe(false);
  expect(validator.validateSave(null).success).toBe(false);
  expect(validator.default("hello").validate(null)).toBe("hello");
  expect(validator.default("hello").validate(undefined)).toBe("hello");
  expect(validator.default("hello").validate("world")).toBe("world");

  expect(validator.coerceSave(undefined).success).toBe(false);
  expect(validator.coerceSave(null).success).toBe(false);
  expect(validator.default("hello").coerce(null)).toBe("hello");
  expect(validator.default("hello").coerce(undefined)).toBe("hello");
  expect(validator.default("hello").coerce("world")).toBe("world");
});

test("BaseType: adding validator", () => {
  const validator = new LuftString();
  let newValidator = validator.beforeValidateHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
  newValidator = validator.beforeCoerceHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
  newValidator = validator.afterValidateHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
  newValidator = validator.afterCoerceHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
  newValidator = validator.beforeHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
  newValidator = validator.afterHook(value => ({ action: "continue", data: value }));
  expect(validator).not.toBe(newValidator);
});

test("BaseType: or", () => {
  const validator = new LuftString();
  expect(validator.validateSave(null).success).toBe(false);
  expect(validator.or(new LuftNull()).validateSave(null).success).toBe(true);
});

test("BaseType: before validate hook", () => {
  const alwaysFalse = new LuftString().beforeValidateHook((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context));
    return { action: "abort" };
  });
  expect(alwaysFalse.validateSave("hello").success).toBe(false);

  const addWorld = new LuftString().beforeValidateHook((value, context) => {
    return { action: "continue", data: value + " world" };
  });
  expect(addWorld.clone().validate("hello")).toBe("hello world");
  expect(addWorld.clone().coerce("hello")).toBe("hello");
});

test("BaseType: before coerce hook", () => {
  const alwaysFalse = new LuftString().beforeCoerceHook((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context));
    return { action: "abort" };
  });
  expect(alwaysFalse.coerceSave("hello").success).toBe(false);

  const addWorld = new LuftString().beforeCoerceHook((value, context) => {
    return { action: "continue", data: value + " world" };
  });
  expect(addWorld.coerce("hello")).toBe("hello world");
  expect(addWorld.validate("hello")).toBe("hello");
});

test("BaseType: invalid hooks", () => {
  const invalidFalse = new LuftString().beforeValidateHook((value, context) => {
    return { action: "abort" };
  });
  expect(() => invalidFalse.validate("hello")).toThrow(LuftValidationUsageError);

  const invalidTrue = new LuftString().beforeValidateHook((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context));
    return { action: "continue", data: value };
  });
  expect(() => invalidTrue.validate("hello")).toThrow(LuftValidationUsageError);
});

test("BaseType: deprecated", () => {
  const validator = new LuftString().deprecated(true, "Try using char arrays instead");
  const loggedValues: any[] = [];

  // Mock console to get the error message printed to the console
  const oldLog = global.console.log;
  global.console.log = (...args: any[]) => {
    loggedValues.push(args);
  };
  expect(validator.validateSave("hello").success).toBe(true);
  expect(loggedValues).toStrictEqual([
    ["Detected deprecated usage of LuftString at", ""],
    ["Deprecation message: Try using char arrays instead"],
  ]);

  loggedValues.length = 0;
  const objectValidator = new LuftObject({
    type: {
      name: new LuftString().deprecated(true),
    },
  });
  expect(objectValidator.validateSave({ name: "hello" }).success).toBe(true);
  expect(loggedValues).toStrictEqual([["Detected deprecated usage of LuftString at", "name"]]);
  global.console.log = oldLog;
});

test("BaseType: description", () => {
  const validator = new LuftString().description("hello world");
  expect(validator.validationStorage.description).toBe("hello world");
});

test("BaseType: after hook continue", () => {
  const validator = new LuftNumber()
    .afterHook(value => ({
      action: "continue",
      data: value * 2,
    }))
    .afterHook(value => ({ action: "continue", data: value * 2 }));
  expect(validator.validate(3)).toBe(12);
  expect(validator.validate(4.5)).toBe(18);
});

test("BaseType: after hook break", () => {
  const validator = new LuftNumber()
    .afterHook(value => ({
      action: "break",
      data: value * 2,
    }))
    .afterHook(value => ({ action: "continue", data: value * 2 }));
  expect(validator.validate(3)).toBe(6);
  expect(validator.validate(4.5)).toBe(9);
});

test("BaseType: after hook error", () => {
  const validator = new LuftNumber().afterHook((value, context) => {
    context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, parser: "non", path: [], message: "not working" });
    return {
      action: "abort",
    };
  });
  expect(() => validator.validate(3)).toThrow(LuftValidationError);
});

test("BaseType: name", () => {
  const validator = new LuftNumber().named("hello-my-name-is-string");
  expect(validator.validationStorage.name).toBe("hello-my-name-is-string");
  expect(validator.clone().validationStorage.name).toBe("hello-my-name-is-string");
  expect(validator.named(undefined).clone().validationStorage.name).toBe(undefined);
});

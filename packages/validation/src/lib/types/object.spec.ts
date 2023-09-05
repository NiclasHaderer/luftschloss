import { AdditionalKeysError, LuftErrorCodes, LuftValidationError, MissingKeysError } from "../validation-error";
import { UnsuccessfulParsingResult } from "./base-types";
import { LuftNumber } from "./number";
import { LuftObject } from "./object";
import { LuftString } from "./string";

const getObjectValidator = () =>
  new LuftObject({
    type: {
      hello: new LuftString(),
      world: new LuftNumber(),
      nested: new LuftObject({
        type: {
          hello: new LuftString(),
          world: new LuftNumber(),
        },
      }),
    },
  })
    .named("ObjectType")
    .description("ObjectType description")
    .deprecated(true, "IDK why");

test("ObjectType: valid object", () => {
  const validator = getObjectValidator();
  const result = validator.validateSave({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } });
  expect(result.success).toBe(true);
  expect(validator.validateSave("hello").success).toBe(false);
});

test("ObjectType: missing keys", () => {
  const validator = getObjectValidator().treatMissingKeyAs("error");
  validator.schema.type.nested = validator.schema.type.nested.treatMissingKeyAs("error");
  const result = validator.validateSave({ hello: "hello", world: 1, nested: { hello: "nested hello" } });
  expect(result.success).toBe(false);
  const unsuccessful = result as UnsuccessfulParsingResult;
  expect(unsuccessful.issues.length).toBe(1);
  expect(unsuccessful.issues[0].code).toBe(LuftErrorCodes.MISSING_KEYS);
  expect((unsuccessful.issues[0] as MissingKeysError).missingKeys).toEqual(["world"]);

  const validator2 = new LuftObject({
    type: {
      hello: new LuftString().optional(),
      world: new LuftNumber().optional(),
    },
  });

  expect(() => validator2.treatMissingKeyAs("error").coerce({})).toThrow(LuftValidationError);
  expect(validator2.coerce({})).toEqual({ hello: undefined, world: undefined });
});

test("ObjectType: to many keys", () => {
  const validator = getObjectValidator().ignoreUnknownKeys(false);

  const result = validator.validateSave({
    hello: "hello",
    world: 1,
    toMany: 3,
    nested: { hello: "nested hello", world: 2 },
  });
  expect(result.success).toBe(false);
  const unsuccessful = result as UnsuccessfulParsingResult;
  expect(unsuccessful.issues.length).toBe(1);
  expect(unsuccessful.issues[0].code).toBe(LuftErrorCodes.TO_MANY_KEYS);
  expect((unsuccessful.issues[0] as AdditionalKeysError).additionalKeys).toEqual(["toMany"]);
});

test("ObjectType: strip unnecessary keys", () => {
  const validator = getObjectValidator();
  expect(
    validator.validate({ hello: "hello", world: 1, toMany: 3, nested: { hello: "nested hello", world: 2 } })
  ).toEqual({
    hello: "hello",
    world: 1,
    nested: { hello: "nested hello", world: 2 },
  });
});

test("ObjectType: string parsing", () => {
  const validator = getObjectValidator().tryParseString(true);

  expect(
    validator.coerce(`{"hello": "hello","world": 1,"toMany": 3,"nested": { "hello": "nested hello", "world": 2 }}`)
  ).toEqual({
    hello: "hello",
    world: 1,
    nested: { hello: "nested hello", world: 2 },
  });

  expect(() => validator.coerce("not-parsable")).toThrow(LuftValidationError);
});

test("ObjectType: omit", () => {
  const validator = getObjectValidator().omit(["world", "hello"]);
  const result = validator.validate({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } });
  expect(result).toEqual({
    nested: { hello: "nested hello", world: 2 },
  });
  expect(result.nested.hello).toBe("nested hello");
  expect(result.nested.world).toBe(2);
});

test("ObjectType: pick", () => {
  const validator = getObjectValidator().pick(["nested"]);
  const result = validator.validate({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } });
  expect(result).toEqual({
    nested: { hello: "nested hello", world: 2 },
  });
  expect(result.nested.hello).toBe("nested hello");
  expect(result.nested.world).toBe(2);
});

test("ObjectType: partial", () => {
  const validator = getObjectValidator().partial().treatMissingKeyAs("undefined");
  const result1 = validator.validate({});
  expect(result1).toEqual({});

  const result = validator.validate({ nested: { hello: "nested hello", world: 2 } });
  expect(result).toEqual({ nested: { hello: "nested hello", world: 2 } });
  expect(result?.nested?.hello).toBe("nested hello");
  expect(result?.nested?.world).toBe(2);
});

test("ObjectType: merge", () => {
  let validator: LuftObject<any> = getObjectValidator();
  expect(validator.validateSave({}).success).toBe(false);
  validator = validator.partial();
  expect(validator.validateSave({}).success).toBe(true);
  validator = validator.merge({
    newKey: new LuftString(),
  });

  expect(validator.validate({ newKey: "newKey" })).toEqual({ newKey: "newKey" });
});

test("ObjectType: extend", () => {
  let validator: LuftObject<any> = getObjectValidator();
  expect(validator.validateSave({}).success).toBe(false);
  validator = validator.partial();
  expect(validator.validateSave({}).success).toBe(true);
  validator = validator.extend(
    new LuftObject({
      type: {
        newKey: new LuftString(),
      },
    })
  );

  expect(validator.validate({ newKey: "newKey" })).toEqual({ newKey: "newKey" });
});

test("ObjectType: null instead of undefined", () => {
  const validator = new LuftObject({
    type: {
      hello: new LuftString().optional(),
    },
  });

  expect(validator.validateSave({ hello: null }).success).toBe(false);
});

test("ObjectType: check if undefined is left out", () => {
  const validator1 = new LuftObject({
    type: {
      hello: new LuftString().optional(),
    },
  });

  const data1 = validator1.validate({});
  expect(data1).toStrictEqual({});

  const validator2 = validator1.omitUndefinedKeys(false);
  const data2 = validator2.validate({});
  expect(data2).toStrictEqual({ hello: undefined });
});

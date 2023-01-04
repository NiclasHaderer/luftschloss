import { isArray } from "@luftschloss/common";
import { luft } from "@luftschloss/validation";
import { mockAll } from "./types/all";

test("Mocking: any generation", () => {
  const validator = luft.any();
  for (let i = 0; i < 100; i++) {
    const result = mockAll(validator);
    expect(validator.validate(result)).toBe(result);
  }
});

test("Mocking: array generation 1", () => {
  const validator = luft.array(luft.bool()).maxLength(10).minLength(5);
  for (let i = 0; i < 100; i++) {
    const result = mockAll(validator);
    expect(isArray(result)).toBe(true);
    expect(result.length >= 5).toBe(true);
    expect(result.length <= 10).toBe(true);
    expect(result.every(item => typeof item === "boolean")).toBe(true);
    expect(validator.validate(result)).toStrictEqual(result);
  }
});

test("Mocking: array generation 2", () => {
  const validator = luft.array(luft.int()).maxLength(10).minLength(5);
  const result1 = mockAll(validator);
  expect(validator.validate(result1)).toStrictEqual(result1);
});

test("Mocking: array generation 3", () => {
  const validator = luft.array(luft.date()).maxLength(10).minLength(5);
  const result1 = mockAll(validator);
  expect(validator.validate(result1)).toStrictEqual(result1);
});

test("Mocking: array generation 4", () => {
  const validator = luft
    .array(
      luft.object({
        hello: luft.string(),
        world: luft.number(),
      })
    )
    .maxLength(10)
    .minLength(5);
  const result1 = mockAll(validator);
  expect(validator.validate(result1)).toStrictEqual(result1);
});

test("Mocking: bool generation", () => {
  const result = mockAll(luft.bool());
  expect(typeof result).toBe("boolean");
});

test("Mocking: date generation", () => {
  for (let i = 0; i < 1000; i++) {
    const min = Date.now() - 2000;
    const max = Date.now();
    const validator = luft.date().before(max).after(min);
    const result = mockAll(validator);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(min);
    expect(result.getTime()).toBeLessThan(max);
    expect(validator.validate(result)).toStrictEqual(result);
  }
});

test("Mocking: int generation 1", () => {
  for (let i = 0; i < 1000; i++) {
    const min = -30;
    const max = 20;
    const validator = luft.int().min(min).max(max);
    const result = mockAll(validator);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(min);
    expect(result).toBeLessThan(max);
    expect(Math.abs(result % 1)).toBe(0);
    expect(validator.validate(result)).toBe(result);
  }
});
test("Mocking: int generation 2", () => {
  for (let i = 0; i < 1000; i++) {
    const validator = luft.int();
    const result = mockAll(validator);
    expect(typeof result).toBe("number");
    expect(Math.abs(result % 1)).toBe(0);
    expect(validator.validate(result)).toBe(result);
  }
});

test("Mocking: literal generation", () => {
  const literals = [1, "hello", true] as const;
  const validator = luft.literal(literals);
  for (let i = 0; i < 100; i++) {
    const result = mockAll(validator);
    expect(literals).toContain(result);
    expect(validator.validate(result)).toStrictEqual(result);
  }
});

test("Mocking: never generation", () => {
  const validator = luft.never();
  expect(() => mockAll(validator)).toThrow(Error("Never cannot be mocked"));
});

test("Mocking: null generation", () => {
  const validator = luft.null();
  const result = mockAll(validator);
  expect(result).toBeNull();
  expect(validator.validate(result)).toStrictEqual(result);
});

test("Mocking: number generation 1", () => {
  for (let i = 0; i < 1000; i++) {
    const min = -30;
    const max = 20;
    const validator = luft.number().min(min).max(max);
    const result = mockAll(validator);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(min);
    expect(result).toBeLessThan(max);
    expect(validator.validate(result)).toBe(result);
  }
});

test("Mocking: number generation 2", () => {
  for (let i = 0; i < 1000; i++) {
    const validator = luft.number();
    const result = mockAll(validator);
    expect(typeof result).toBe("number");
    expect(validator.validate(result)).toBe(result);
  }
});

test("Mocking: object generator", () => {
  const validator = luft.object({
    hello: luft.string(),
    world: luft.number(),
    nested: luft.object({
      hello: luft.string(),
      world: luft.number(),
    }),
  });
  const result = mockAll(validator);
  expect(validator.validate(result)).toStrictEqual(result);
});

test("Mocking: object generator", () => {
  const validator = luft.object({
    name: luft.string(),
    address: luft.string(),
    country: luft.string(),
    age: luft.int().min(0).max(120),
  });
  const result = mockAll(validator);
  expect(validator.validate(result)).toStrictEqual(result);
});

test("Mocking: record generator", () => {
  const validator = luft.record(
    luft.string().min(10).max(20),
    luft.object({
      name: luft.string(),
      address: luft.string(),
      country: luft.string(),
      age: luft.int().min(0).max(120),
    })
  );
  const result = mockAll(validator);
  expect(validator.validate(result)).toStrictEqual(result);
  expect([...Object.keys(result)].every(k => k.length >= 10 && k.length <= 20)).toBe(true);
});

test("Mocking: string 1", () => {
  const validator = luft.string().min(10).max(20).trim(true);
  for (let i = 0; i < 1000; i++) {
    const result = mockAll(validator);
    expect(validator.validate(result)).toBe(result);
    expect(result.length).toBeGreaterThanOrEqual(10);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(typeof result).toBe("string");
    expect(result.trim().length).toBe(result.length);
  }
});

test("Mocking: string 2", () => {
  const validator = luft.string();
  for (let i = 0; i < 1000; i++) {
    const result = mockAll(validator);
    expect(validator.validate(result)).toBe(result);
    expect(typeof result).toBe("string");
  }
});

test("Mocking: tuple", () => {
  const validator = luft.tuple([luft.string(), luft.number(), luft.bool()]);
  const result = mockAll(validator);
  expect(validator.validate(result)).toStrictEqual(result);
});

test("Mocking: undefined", () => {
  const validator = luft.undefined();
  const result = mockAll(validator);
  expect(result).toBeUndefined();
});

test("Mocking: union", () => {
  const validator = luft.union([luft.string(), luft.number(), luft.bool()]);
  const result = mockAll(validator);
  expect(["string", "number", "bool"]).toContain(typeof result);
});

test("Mocking: regex", () => {
  const validator = luft.regex(/\d/);
  expect(() => mockAll(validator)).toThrow(
    "Could not find a mocking factory for LuftRegex. Add one yourself with `registerMock`"
  );
});

test("Mocking: uuid", () => {
  const validator = luft.uuid();
  for (let i = 0; i < 100; i++) {
    const result = mockAll(validator);
    expect(validator.validate(result)).toBe(result);
  }
});

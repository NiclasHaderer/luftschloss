import { fakeAll } from "./types/all"
import { luft } from "@luftschloss/validation"
import { isArray } from "@luftschloss/core"

test("Mock array generation 1", () => {
  const validator = luft.array(luft.bool()).maxLength(10).minLength(5)
  for (let i = 0; i < 100; i++) {
    const result = fakeAll(validator)
    expect(isArray(result)).toBe(true)
    expect(result.length >= 5).toBe(true)
    expect(result.length <= 10).toBe(true)
    expect(result.every(item => typeof item === "boolean")).toBe(true)
    expect(validator.validate(result)).toStrictEqual(result)
  }
})

test("Mock array generation 2", () => {
  const validator = luft.array(luft.int()).maxLength(10).minLength(5)
  const result1 = fakeAll(validator)
  expect(validator.validate(result1)).toStrictEqual(result1)
})

test("Mock array generation 3", () => {
  const validator = luft.array(luft.date()).maxLength(10).minLength(5)
  const result1 = fakeAll(validator)
  expect(validator.validate(result1)).toStrictEqual(result1)
})

test("Mock array generation 4", () => {
  const validator = luft
    .array(
      luft.object({
        hello: luft.string(),
        world: luft.number(),
      })
    )
    .maxLength(10)
    .minLength(5)
  const result1 = fakeAll(validator)
  expect(validator.validate(result1)).toStrictEqual(result1)
})

test("Mock bool generation", () => {
  const result = fakeAll(luft.bool())
  expect(typeof result).toBe("boolean")
})

test("Mock date generation", () => {
  for (let i = 0; i < 1000; i++) {
    const min = Date.now() - 2000
    const max = Date.now()
    const validator = luft.date().before(max).after(min)
    const result = fakeAll(validator)
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBeGreaterThan(min)
    expect(result.getTime()).toBeLessThan(max)
    expect(validator.validate(result)).toStrictEqual(result)
  }
})

test("Mock int generation", () => {
  for (let i = 0; i < 1000; i++) {
    const min = -30
    const max = 20
    const validator = luft.int().min(min).max(max)
    const result = fakeAll(validator)
    expect(typeof result).toBe("number")
    expect(result).toBeGreaterThan(min)
    expect(result).toBeLessThan(max)
    expect(Math.abs(result % 1)).toBe(0)
    expect(validator.validate(result)).toBe(result)
  }
})

test("Mock literal generation", () => {
  const literals = [1, "hello", true] as const
  const validator = luft.literal(literals)
  for (let i = 0; i < 100; i++) {
    const result = fakeAll(validator)
    expect(literals).toContain(result)
    expect(validator.validate(result)).toStrictEqual(result)
  }
})

test("Mock never generation", () => {
  const validator = luft.never()
  expect(() => fakeAll(validator)).toThrow(Error("Never cannot be mocked"))
})

test("Mock null generation", () => {
  const validator = luft.null()
  const result = fakeAll(validator)
  expect(result).toBeNull()
  expect(validator.validate(result)).toStrictEqual(result)
})

test("Mock number generation", () => {
  for (let i = 0; i < 1000; i++) {
    const min = -30
    const max = 20
    const validator = luft.number().min(min).max(max)
    const result = fakeAll(validator)
    expect(typeof result).toBe("number")
    expect(result).toBeGreaterThan(min)
    expect(result).toBeLessThan(max)
    expect(validator.validate(result)).toBe(result)
  }
})

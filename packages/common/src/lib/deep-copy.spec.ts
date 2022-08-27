import { deepCopy } from "./deep-copy"

test("DeepCopy: shallow object", () => {
  const object = {
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: 4,
    },
  }
  const copy = deepCopy(object)
  expect(copy).toStrictEqual(object)
  expect(copy).not.toBe(object)
  expect(copy.c).not.toBe(object.c)
})

test("DeepCopy: function", () => {
  const object = {
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: 4,
      func: () => "hello",
    },
  }
  const copy = deepCopy(object)
  expect(copy).toStrictEqual(object)
  expect(copy).not.toBe(object)
  expect(copy.c).not.toBe(object.c)
  expect(copy.c.func).toBe(object.c.func)
})

test("DeepCopy: array", () => {
  const object = {
    a: 1,
    b: 2,
    c: {
      d: 3,
      e: 4,
      func: () => "hello",
    },
    arr: [1, 2, { d: 3, e: 4, func: () => "hello" }] as const,
  }
  const copy = deepCopy(object)
  expect(copy).toStrictEqual(object)
  expect(copy).not.toBe(object)
  expect(copy.c).not.toBe(object.c)
  expect(copy.arr).not.toBe(object.arr)
  expect(copy.arr[2].func).toBe(copy.arr[2].func)
  expect(copy.arr[2].func()).toBe("hello")
})

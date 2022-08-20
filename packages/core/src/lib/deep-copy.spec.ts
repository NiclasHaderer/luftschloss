import { deepCopy } from "./deep-copy"

test("Test copy shallow object", () => {
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

test("Test copy with function", () => {
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

test("Test array copy", () => {
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

test("Test class copy", () => {
  class A {
    constructor(public a: number, public b: { c: B }) {}
  }

  class B {
    constructor(public a: Set<A>) {}
  }

  const a = new A(1, { c: new B(new Set<A>().add(new A(1, { c: new B(new Set<A>()) }))) })
  const copy = deepCopy(a)
  expect(copy).toStrictEqual(a)
  expect(copy).not.toBe(a)
  expect(copy.b).not.toBe(a.b)
})

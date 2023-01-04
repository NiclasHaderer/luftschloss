import { getTypeOf } from "./type-of";

test("LuftTypeHelpers: Get type of value", () => {
  expect(getTypeOf(null)).toBe("null");
  expect(getTypeOf(undefined)).toBe("undefined");
  // Check all possible types for getTypeOf
  expect(getTypeOf(true)).toBe("boolean");
  expect(getTypeOf(false)).toBe("boolean");
  expect(getTypeOf(0)).toBe("int");
  expect(getTypeOf(1)).toBe("int");
  expect(getTypeOf(1.1)).toBe("float");

  class C {}

  expect(getTypeOf(new C())).toBe("C");
  expect(getTypeOf(NaN)).toBe("NaN");
  expect(getTypeOf(Infinity)).toBe("Infinity");
  expect(getTypeOf(-Infinity)).toBe("-Infinity");
  expect(getTypeOf([])).toBe("array");
  expect(getTypeOf({})).toBe("object");
});

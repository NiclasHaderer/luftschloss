import { Singleton } from "./singleton";

@Singleton()
class C1 {}

@Singleton()
class C2 {}

test("Test if singleton is working", () => {
  const c1 = new C1();
  const c2 = new C1();
  expect(c1).toBe(c2);
});

test("Test if singleton is working", () => {
  const c1 = new C1();
  const c2 = new C2();
  expect(c1).not.toBe(c2);
});

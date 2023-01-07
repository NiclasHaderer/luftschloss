import { Cache } from "./cache";

class CacheTest {
  @Cache({ maxSize: 100 })
  public rand(num: number) {
    return Math.random();
  }
}

describe("Cache working", () => {
  it("should cache only for the same instance", () => {
    for (let i = 0; i < 100; i++) {
      expect(new CacheTest().rand(i)).not.toBe(new CacheTest().rand(i));
    }
  });

  it("should cache for instance", () => {
    const test = new CacheTest();
    const randomValue = test.rand(1);
    for (let i = 0; i < 100; i++) {
      expect(randomValue).toBe(test.rand(1));
    }
  });

  it("should emtpy cache if maxSize is reached", () => {
    const test = new CacheTest();
    const randomValue = test.rand(0);
    expect(randomValue).toBe(test.rand(0));
    for (let i = 0; i < 100; i++) {
      test.rand(i);
    }
    expect(randomValue).toBe(test.rand(0));
    test.rand(100);
    expect(randomValue).not.toBe(test.rand(0));
  });
});

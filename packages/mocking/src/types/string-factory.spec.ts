import { StringFactories, StringFactory, stringFactory } from "./string-factory";

test("StringMock: factory retrieval 1", () => {
  const factoryName = stringFactory("graph");
  expect(factoryName).toBe("paragraph");
});

test("StringMock: factory retrieval 2", () => {
  const factoryName = stringFactory("fdasdf");
  expect(factoryName).toBe("random");
});

test("StringMock: factory retrieval 3", () => {
  const factoryName = stringFactory("homeAddress");
  expect(factoryName).toBe("address");
});

test("StringMock: test factories", () => {
  for (const key of Object.keys(StringFactories) as StringFactory[]) {
    const factory = StringFactories[key];
    const result = factory();
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result).toBe("string");
  }
});

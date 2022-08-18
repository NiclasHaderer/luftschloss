import { StringFactories, StringFactory, stringFactory } from "./string-factory"

test("Add factory retrieval 1", () => {
  const factoryName = stringFactory("graph")
  expect(factoryName).toBe("paragraph")
})

test("Add factory retrieval 2", () => {
  const factoryName = stringFactory("fdasdf")
  expect(factoryName).toBe("word")
})

test("Add factory retrieval 3", () => {
  const factoryName = stringFactory("homeAddress")
  expect(factoryName).toBe("address")
})

test("Test factories", () => {
  for (const key of Object.keys(StringFactories) as StringFactory[]) {
    const factory = StringFactories[key]
    const result = factory()
    expect(result.length).toBeGreaterThan(0)
    expect(typeof result).toBe("string")
  }
})
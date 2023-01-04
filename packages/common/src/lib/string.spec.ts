import { splitFirst } from "./string"

describe("Should split string correctly", () => {
  it("Should not split the string at all", () => {
    expect(splitFirst("hello", ";")).toEqual(["hello"])
  })

  it("Should split the string only once", () => {
    expect(splitFirst("hello", "l")).toEqual(["he", "lo"])
  })

  it("Should split the string only once", () => {
    expect(splitFirst("hello", "e")).toEqual(["h", "llo"])
  })

  it("Should split the string if the character is the first one", () => {
    expect(splitFirst("anna", "a")).toEqual(["", "nna"])
  })

  it("Should split the string if the character is the last one", () => {
    expect(splitFirst("hello", "o")).toEqual(["hell", ""])
  })
})

import { trimIndent } from "./trim-indent"

test("TrimIndent: tag literal", () => {
  const str = trimIndent`
      1
        ${2}
          3
        ${4}
      5
    `
  expect(str).toBe(`1\n  2\n    3\n  4\n5`)
  const str1 = trimIndent`
      1
        ${2}
          3 ${"-"}
        ${4}
      5
    `
  expect(str1).toBe(`1\n  2\n    3 -\n  4\n5`)

  const str2 = trimIndent`
      1
        2
        ${3}
        ___
          ${str}
        ${4}
      ${5}
    `
  expect(str2).toBe(`1\n  2\n  3\n  ___\n    1\n      2\n        3\n      4\n    5\n  4\n5`)

  const str3 = trimIndent`
        1
      ___
      ${str1}
    `
  expect(str3).toBe(`  1\n___\n1\n  2\n    3 -\n  4\n5`)
})

test("TrimIndent: tag literal lowest indent is literal", () => {
  const str = trimIndent`
      ${1}
        2
          3
    `
  expect(str).toBe(`1\n  2\n    3`)
})

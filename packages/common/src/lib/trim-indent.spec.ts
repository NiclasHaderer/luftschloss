import { trimIndent } from "./trim-indent"

test("TrimIndent: tag literal", () => {
  // tag templates in between
  const str = trimIndent`
      1
        ${2}
          3
        ${4}
      5
    `
  expect(str).toBe(`1\n  2\n    3\n  4\n5`)

  // tag templates after a non emtpy string
  const str1 = trimIndent`
      1
        ${2}
          3 ${"-"}
        ${4}
      5
    `
  expect(str1).toBe(`1\n  2\n    3 -\n  4\n5`)

  // tag templates with indented string
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

  // tag templates with indented string as the lowest indent
  const str3 = trimIndent`
          1
        ___
      ${str1}
    `
  expect(str3).toBe(`    1\n  ___\n1\n  2\n    3 -\n  4\n5`)
})

describe("TrimIndent: tag literal has the lowest indent", () => {
  test("Standard", () => {
    const str1 = trimIndent`
      ${1}
        2
          3
    `
    expect(str1).toBe(`1\n  2\n    3`)
  })

  test("With a empty line in the middle", () => {
    const str2 = trimIndent`
      ${1}
        2
          3

        4
    `
    expect(str2).toBe(`1\n  2\n    3\n\n  4`)
  })

  test("With a empty line at the end", () => {
    const str3 = trimIndent`
      ${1}
        2
          3

    `
    expect(str3).toBe(`1\n  2\n    3\n`)
  })

  test("With a space indented empty line at the end", () => {
    const str3 = trimIndent`
      ${1}
        2
          3

    `
    expect(str3).toBe(`1\n  2\n    3\n`)
  })

  test("With a empty line at the end after a literal", () => {
    const str3 = trimIndent`
        2
          3
      ${1}

    `
    expect(str3).toBe(`  2\n    3\n1\n`)
  })

  test("With a space indented empty line at the end after a literal", () => {
    const str3 = trimIndent`
        2
          3
      ${1}

    `
    expect(str3).toBe(`  2\n    3\n1\n`)
  })

  test("With a empty line at the beginning before an template literal", () => {
    const str3 = trimIndent`

      ${1}
        2
          3
    `
    expect(str3).toBe(`\n1\n  2\n    3`)
  })

  test("With a space indented empty line at the beginning before an template literal", () => {
    const str3 = trimIndent`

      ${1}
        2
          3
    `
    expect(str3).toBe(`\n1\n  2\n    3`)
  })

  test("With a space indented empty line at the beginning", () => {
    const str3 = trimIndent`

        2
      ${1}
          3
    `
    expect(str3).toBe(`\n  2\n1\n    3`)
  })
})

describe("TrimIndent: non valid template strings", () => {
  test("No new line at the beginning", () => {
    expect(
      () => trimIndent`a
    `
    ).toThrow()
  })
  test("No new line at the end", () => {
    expect(
      () => trimIndent`
    a`
    ).toThrow()
  })
})

describe("TrimIndent: string trim indent", () => {
  test("No empty line", () => {
    const str = trimIndent(`
      1
        2
          3
      4
    5
  `)

    expect(str).toBe(`\n  1\n    2\n      3\n  4\n5\n`)
  })

  test("Empty line at the beginning", () => {
    const str = trimIndent(`

      1
        2
          3
      4
    5
  `)

    expect(str).toBe(`\n\n  1\n    2\n      3\n  4\n5\n`)
  })
  test("Empty line at the end", () => {
    const str = trimIndent(`
      1
        2
          3
      4
    5

  `)

    expect(str).toBe(`\n  1\n    2\n      3\n  4\n5\n\n`)
  })
  test("Empty line in the middle", () => {
    const str = trimIndent(`
      1
        2
          3

      4
    5
  `)

    expect(str).toBe(`\n  1\n    2\n      3\n\n  4\n5\n`)
  })
})

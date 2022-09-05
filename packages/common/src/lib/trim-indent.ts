export function trimIndent(strings: TemplateStringsArray, ...args: any[]): string
export function trimIndent(string: string): string
export function trimIndent(strings: TemplateStringsArray | string, ...args: any[]): string {
  if (Array.isArray(strings)) {
    return trimTemplate([...strings], args)
  }
  return trimString(strings as string)
}

const trimTemplate = (strings: string[], args: any[]): string => {
  // Check if the template string hast the right format (empty line break at the beginning and the end)
  const startsWithNewLine = /^ *\n/.test(strings[0])
  const endsWithNewLine = /\n *$/.test(strings[strings.length - 1])
  if (!startsWithNewLine || !endsWithNewLine) {
    throw new Error("TrimIndent template literal only works if the string begins and ends with a new line")
  }

  // Delete first and last line, because by definition they cannot contain any content
  strings[0] = strings[0].replace(/^ *\n/, "")
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\n *$/, "")

  // Get the minimal indent for the template parts
  // TODO try to respect if a template literal is the thing with least indents
  const indentSize = Math.min(
    ...strings
      // Break new lines
      .flatMap(s => s.split("\n"))
      // Ignore empty lines
      .filter(s => !!s.trim())
      // Get the indent size
      .map(s => s.match(/^ */)?.[0].length || 0)
  )

  // Join the template parts with the arg parts
  let combinedString = ""
  for (const [index, string] of strings.entries()) {
    // Remove the indent from the non template part of the string
    const newLineStrings = string.split("\n").map(s => s.slice(indentSize))
    combinedString += newLineStrings.join("\n")

    // Get the remaining indent of the non template part
    const remainingIndent = newLineStrings[newLineStrings.length - 1].match(/^ */)?.[0].length || 0

    if (index < args.length) {
      // Remove the common indent from the string
      const normalizedString = trimString(args[index].toString())
      // Pad the string with the remaining indent from the last
      const stringWithIndent = normalizedString
        .split("\n")
        .map(s => " ".repeat(remainingIndent) + s)
        .join("\n")
      combinedString += stringWithIndent
    }
  }
  return combinedString
}

const trimString = (strings: string): string => {
  const newLineStrings = strings.split("\n")
  const indentSize = Math.min(...newLineStrings.map(s => s.match(/^ */)?.[0].length || 0))
  return newLineStrings.map(s => s.slice(indentSize)).join("\n")
}

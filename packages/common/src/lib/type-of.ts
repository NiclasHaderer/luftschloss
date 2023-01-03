import { isArray } from "./utils"

export const getTypeOf = (value: unknown) => {
  const type = typeof value
  if (type === "object") {
    if (isArray(value)) return "array" as const
    if (value === null) return "null" as const
    if ((value as object).constructor.name === "Object") return "object" as const
    return (value as object).constructor.name
  }
  if (type === "number") {
    if (isNaN(value as number)) {
      return "NaN" as const
    } else if (value === Infinity) {
      return "Infinity" as const
    } else if (value === -Infinity) {
      return "-Infinity" as const
    } else if ((value as number) % 1 !== 0) {
      return "float" as const
    } else {
      return "integer" as const
    }
  }
  return type
}

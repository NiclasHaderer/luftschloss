import { PathValidator } from "../core/route-collector.model"

const NumberPathValidator: PathValidator<number> = {
  name: "number",
  validate(value: string): [true, number] | [false, null] {
    const num = parseFloat(value)
    const isNan = Number.isNaN(num)
    return [!isNan, isNan ? null : num] as [true, number] | [false, null]
  },
}

export const numberPathValidator = () => NumberPathValidator

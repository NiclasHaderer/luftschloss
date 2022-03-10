type ValidatorName = string

export type PathValidators = Record<ValidatorName, PathValidator<any>>

export type PathValidator<T extends {}> = {
  name: ValidatorName
  regex: RegExp
  convert(value: string): T
}

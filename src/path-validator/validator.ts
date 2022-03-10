export type PathValidator<T extends {}> = {
  name: string
  regex: RegExp
  convert(value: string): T
}

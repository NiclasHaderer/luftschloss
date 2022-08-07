import { ParsingError } from "./parsing-error"

export class ParsingContext {
  private _issues: ParsingError[] = []
  public readonly path: Readonly<string | number[]> = []

  public addIssue(...issue: ParsingError[]): ParsingContext {
    this._issues.push(...issue)
    return this
  }

  public get hasIssues() {
    return this._issues.length !== 0
  }

  public get issues() {
    return this._issues
  }

  public clone() {
    const newContext = new ParsingContext()
    // TODO copy path as well
    return newContext.addIssue(...this._issues.map(i => ({ ...i })))
  }

  public cloneEmpty() {
    const newContext = new ParsingContext()
    // TODO copy path as well
    return newContext
  }
}

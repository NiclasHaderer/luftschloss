import { ParsingError } from "./parsing-error"

export class ParsingContext {
  private _issues: ParsingError[] = []
  public readonly path: Readonly<string | number[]> = []

  public addIssue(issue: ParsingError): ParsingContext {
    this._issues.push(issue)
    return this
  }

  public get hasIssues() {
    return this._issues.length !== 0
  }

  public get issues() {
    return this._issues
  }
}

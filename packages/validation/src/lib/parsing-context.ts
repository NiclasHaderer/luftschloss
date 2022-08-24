import { ParsingError } from "./parsing-error"

export class ParsingContext {
  private _issues: ParsingError[] = []
  public path: Readonly<string | number[]> = []

  constructor(public readonly mode: "coerce" | "validate") {}

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

  /**
   * @internal
   */
  public stepInto(...path: (string | number)[]): ParsingContext {
    this.path = [...this.path, ...path] as Readonly<string | number[]>
    return this
  }

  /**
   * @internal
   */
  public stepOut(): ParsingContext {
    this.path = this.path.slice(0, this.path.length - 1)
    return this
  }

  public clone() {
    return new ParsingContext(this.mode).stepInto(...this.path).addIssue(...this._issues.map(i => ({ ...i })))
  }

  public cloneEmpty() {
    return new ParsingContext(this.mode).stepInto(...this.path)
  }
}

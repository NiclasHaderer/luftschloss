/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftDate extends LuftBaseType<Date> {
  public readonly supportedTypes = ["date"]
  protected returnType!: Date

  constructor(
    public readonly schema: {
      after: number
      before: number
      minCompare: ">=" | ">"
      maxCompare: "<=" | "<"
    }
  ) {
    super()
  }

  public clone(): LuftDate {
    return new LuftDate({ ...this.schema })
  }

  public after(date: Date | number | string): LuftDate {
    this.schema.after = this.toDateNumber(date)
    this.schema.minCompare = ">"
    return this
  }

  public before(date: Date | number | string): LuftDate {
    this.schema.before = this.toDateNumber(date)
    this.schema.maxCompare = "<"
    return this
  }

  public afterEq(date: Date | number | string): LuftDate {
    this.schema.after = this.toDateNumber(date)
    this.schema.minCompare = ">="
    return this
  }

  public beforeEq(date: Date | number | string): LuftDate {
    this.schema.before = this.toDateNumber(date)
    this.schema.maxCompare = "<="
    return this
  }

  private toDateNumber(date: Date | number | string): number {
    if (typeof date === "number") {
      return date
    }

    if (typeof date === "string") {
      const parsedDate = Date.parse(date)
      if (isNaN(parsedDate)) throw new Error(`Could not parse date: ${date}`)
      return parsedDate
    }

    return date.getTime()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<Date> {
    // Coerce from number to date
    if (typeof data === "number") {
      data = new Date(data)
    }

    // Try to parse the date
    if (typeof data === "string") {
      const newData = Date.parse(data)
      // The date is invalid, therefore just validate the non-parsed string
      if (isNaN(newData)) {
        return this._validate(data, context)
      } else {
        // Valid date, so pass it on to the validation function
        data = new Date(newData)
      }
    }

    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<Date> {
    if (!(data instanceof Date)) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return {
        success: false,
      }
    }

    if (this.schema.after !== undefined && data.getTime() < this.schema.after) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected date after ${this.schema.after}, but got ${data.getTime()}`,
        path: [...context.path],
        max: this.schema.before ?? Infinity,
        min: this.schema.after,
        actual: data.getTime(),
        maxCompare: this.schema.maxCompare,
        minCompare: this.schema.minCompare,
      })
      return { success: false }
    }

    if (this.schema.before !== undefined && data.getTime() > this.schema.before) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected date before ${this.schema.before}, but got ${data.getTime()}`,
        path: [...context.path],
        max: this.schema.before,
        min: this.schema.after ?? -Infinity,
        actual: data.getTime(),
        maxCompare: this.schema.maxCompare,
        minCompare: this.schema.minCompare,
      })
      return { success: false }
    }

    return {
      success: true,
      data: data,
    }
  }

  protected isToLate(data: Date): boolean {
    if (this.schema.maxCompare === "<") {
      return !(data.getTime() < this.schema.before)
    } else {
      return !(data.getTime() <= this.schema.before)
    }
  }

  protected isToEarly(data: Date): boolean {
    if (this.schema.minCompare === ">") {
      return !(data.getTime() > this.schema.after)
    } else {
      return !(data.getTime() >= this.schema.after)
    }
  }
}

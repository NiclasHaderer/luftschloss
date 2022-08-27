/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes, LuftValidationUsageError } from "../validation-error"
import { InternalParsingResult, LuftBaseType } from "./base-type"
import { ParsingContext } from "../parsing-context"
import { deepCopy } from "@luftschloss/common"

export class LuftDate extends LuftBaseType<Date> {
  public readonly supportedTypes = ["date"]

  constructor(
    public readonly schema: {
      after: number | undefined
      before: number | undefined
      minCompare: ">=" | ">"
      maxCompare: "<=" | "<"
    } = { after: undefined, before: undefined, minCompare: ">=", maxCompare: "<=" }
  ) {
    super()
  }

  public clone(): LuftDate {
    return new LuftDate({ ...this.schema }).replaceValidationStorage(deepCopy(this.validationStorage))
  }

  public after(date: Date | number | string | undefined): LuftDate {
    const newValidator = this.clone()
    newValidator.schema.after = date !== undefined ? this.toDateNumber(date) : date
    newValidator.schema.minCompare = ">"
    return newValidator
  }

  public before(date: Date | number | string | undefined): LuftDate {
    const newValidator = this.clone()
    newValidator.schema.before = date !== undefined ? this.toDateNumber(date) : date
    newValidator.schema.maxCompare = "<"
    return newValidator
  }

  public afterEq(date: Date | number | string | undefined): LuftDate {
    const newValidator = this.clone()
    newValidator.schema.after = date !== undefined ? this.toDateNumber(date) : date
    newValidator.schema.minCompare = ">="
    return newValidator
  }

  public beforeEq(date: Date | number | string | undefined): LuftDate {
    const newValidator = this.clone()
    newValidator.schema.before = date !== undefined ? this.toDateNumber(date) : date
    newValidator.schema.maxCompare = "<="
    return newValidator
  }

  private toDateNumber(date: Date | number | string): number {
    if (typeof date === "number") {
      return date
    }

    if (typeof date === "string") {
      const parsedDate = Date.parse(date)
      if (isNaN(parsedDate)) throw new LuftValidationUsageError(`Could not parse date: ${date}`)
      return parsedDate
    }

    return date.getTime()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<Date> {
    // Coerce from number to date
    if (typeof data === "number") {
      const newData = new Date(data)
      if (!isNaN(newData.getTime())) data = newData
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

    if (this.schema.after && this.isToEarly(data, this.schema.after)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected date after ${this.schema.after}, but got ${data.getTime()}`,
        path: [...context.path],
        max: this.schema.before,
        min: this.schema.after,
        actual: data.getTime(),
        maxCompare: this.schema.maxCompare,
        minCompare: this.schema.minCompare,
      })
      return { success: false }
    }

    if (this.schema.before && this.isToLate(data, this.schema.before)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected date before ${this.schema.before}, but got ${data.getTime()}`,
        path: [...context.path],
        max: this.schema.before,
        min: this.schema.after,
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

  private isToLate(data: Date, expected: number): boolean {
    if (this.schema.maxCompare === "<") {
      return !(data.getTime() < expected)
    } else {
      return !(data.getTime() <= expected)
    }
  }

  private isToEarly(data: Date, expected: number): boolean {
    if (this.schema.minCompare === ">") {
      return !(data.getTime() > expected)
    } else {
      return !(data.getTime() >= expected)
    }
  }
}

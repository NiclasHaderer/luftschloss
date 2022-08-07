/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LuftUUIDString } from "./uuid-string"
import { number } from "zod"
import { UnsuccessfulParsingResult } from "./base-type"
import { InvalidTypeError, LuftErrorCodes } from "../parsing-error"

test("Valid uuid", () => {
  const validator = new LuftUUIDString()
  expect(validator.validateSave("123e4567-e89b-12d3-a456-426614174000").success).toBe(true)
  expect(validator.validateSave("38f2d506-167b-11ed-861d-0242ac120002").success).toBe(true)
  expect(validator.validateSave("e2b38e28-5caa-4de2-9147-a5a410a65d45").success).toBe(true)
  const result = validator.validateSave("123e457-e89b-12d3-a456-426614174000") as UnsuccessfulParsingResult
  expect(result.success).toBe(false)
  expect(result.issues[0].code).toBe(LuftErrorCodes.INVALID_TYPE)
  expect((result.issues[0] as InvalidTypeError).expectedType).toEqual([
    "/[a-fA-F\\d]{8}-[a-fA-F\\d]{4}-[a-fA-F\\d]{4}-[a-fA-F\\d]{4}-[a-fA-F\\d]{12}/",
    "string",
  ])
  expect(validator.validateSave(number).success).toBe(false)
})

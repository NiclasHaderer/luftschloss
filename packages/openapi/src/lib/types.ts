/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodEnum,
  ZodLiteral,
  ZodNever,
  ZodNull,
  ZodNumber,
  ZodObject,
  ZodSet,
  ZodString,
  ZodTuple,
  ZodUndefined,
  ZodUnion,
} from "zod"

export type ZodApiType = ZodObject<any> | ZodNever

type UrlZodPrimitives = ZodNumber | ZodNull | ZodUndefined | ZodString | ZodBigInt | ZodBoolean | ZodDate
type Complex =
  | ZodLiteral<UrlZodPrimitives>
  | ZodEnum<[string, ...string[]]>
  | ZodArray<UrlZodPrimitives>
  | ZodSet<UrlZodPrimitives>
  | ZodTuple<[UrlZodPrimitives, ...UrlZodPrimitives[]]>
  | ZodUnion<[UrlZodPrimitives, ...UrlZodPrimitives[]]>

// ZodLiteral ZodEnum Array Tuple Union Set

export type ZodUrlApiType = ZodObject<{ [key: string]: UrlZodPrimitives | Complex }> | ZodNever

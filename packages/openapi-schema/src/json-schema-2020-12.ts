// https://opis.io/json-schema/2.x/object.html
// https://json-schema.org/understanding-json-schema

// TODO continue at https://json-schema.org/understanding-json-schema/reference/non_json_data.html

interface GenericKeywords {
  title?: string
  description?: string
  default?: any
  examples?: any[]
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean
  $comment: string
}

interface EnumExtensions extends GenericKeywords {
  enum: any[]
}

interface ConstExtensions extends GenericKeywords {
  const: any
}

interface ObjectExtensions extends GenericKeywords {
  type: "object"
  properties?: {
    [key: string]: AllSchemas | boolean
  }
  required?: string[]
  patternProperties?: {
    [key: string]: AllSchemas | boolean
  }
  additionalProperties?: AllSchemas | boolean
  unevaluatedProperties?: AllSchemas | boolean
  minProperties?: number
  maxProperties?: number
  propertyNames?: StringExtensions | boolean
}

interface ArrayExtensions extends GenericKeywords {
  type: "array"
  items?: AllSchemas | boolean | AllSchemas[]
  prefixItems?: AllSchemas[]
  contains?: AllSchemas
  minContains?: number
  maxContains?: number
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
}

interface StringExtensions extends GenericKeywords {
  type: "string"
  minLength?: number
  maxLength?: number
  pattern?: string
  format?:
    | "date-time"
    | "date"
    | "time"
    | "duration"
    | "email"
    | "idn-email"
    | "hostname"
    | "idn-hostname"
    | "ipv4"
    | "ipv6"
    | "uri"
    | "uri-reference"
    | "uuid"
    | "iri"
    | "iri-reference"
    | "json-pointer"
    | "relative-json-pointer"
    | "regex"
    | "uri-template"
}

interface NumberExtensions extends GenericKeywords {
  type: "number" | "integer"
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
  multipleOf?: number
}

interface BooleanExtensions extends GenericKeywords {
  type: "boolean"
}

interface NullExtensions extends GenericKeywords {
  type: "null"
}

type AllSchemas =
  | EnumExtensions
  | ConstExtensions
  | ObjectExtensions
  | ArrayExtensions
  | StringExtensions
  | NumberExtensions
  | BooleanExtensions
  | NullExtensions

type JSONSchema202212 = {
  $id?: string
  $schema: "https://json-schema.org/draft/2020-12/schema"
} & AllSchemas

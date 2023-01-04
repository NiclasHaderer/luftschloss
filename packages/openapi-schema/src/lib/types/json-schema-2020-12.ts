// conditionals have been left out https://json-schema.org/understanding-json-schema/reference/conditionals.html
// vocabulary has been left out https://json-schema.org/understanding-json-schema/reference/schema.html

export interface CommonSchema<SCHEMA extends AllSchemas = AllSchemas> {
  $id?: string;
  $comment?: string;
  $dynamicAnchor?: string;
  $anchor?: string;
  $dynamicRef?: string;
  $ref?: string;
  $defs?: Record<string, SCHEMA>;
  title?: string;
  description?: string;
  default?: any;
  examples?: any[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  /**
   * To validate against `allOf`, the given data must be valid against all of the given subschemas.
   */
  allOf?: SCHEMA[];
  /**
   * To validate against anyOf, the given data must be valid against any (one or more) of the given subschemas.
   */
  anyOf?: SCHEMA[];

  /**
   * To validate against `oneOf`, the given data must be valid against exactly one of the given subschemas.
   */
  oneOf?: SCHEMA[];

  /**
   * The `not` keyword declares that an instance validates if it doesn’t validate against the given subschema.
   * For example, the following schema validates against anything that is not a string:
   */
  not?: SCHEMA;
}

export interface EnumSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  enum: any[];
}

export interface ConstSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  const: any;
}

export interface ObjectSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "object";
  properties?: {
    [key: string]: SCHEMA;
  };
  required?: string[];
  patternProperties?: {
    [key: string]: SCHEMA;
  };
  additionalProperties?: SCHEMA;
  unevaluatedProperties?: SCHEMA;
  propertyNames?: StringSchema | CommonSchema;
  minProperties?: number;
  maxProperties?: number;
}

export interface ArraySchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "array";
  items?: SCHEMA;
  prefixItems?: SCHEMA[];
  contains?: SCHEMA;
  minContains?: number;
  maxContains?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface StringSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
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
    | "uri-template";

  /**
   * The `contentMediaType` keyword specifies the MIME type of the contents of a string, as described in [RFC 2046](https://tools.ietf.org/html/rfc2046). There is a list of [MIME types officially registered by the IANA](https://www.iana.org/assignments/media-types/media-types.xhtml), but the set of types supported will be application and operating system dependent. Mozilla Developer Network also maintains a [shorter list of MIME types that are important for the web](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)
   */
  contentMediaType?: string;
  /**
   * The `contentEncoding` keyword specifies the encoding used to store the contents, as specified in [RFC 2054, part 6.1](https://tools.ietf.org/html/rfc2045) and [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648).
   * The acceptable values are `7bit`, `8bit`, `binary`, `quoted-printable`, `base16`, `base32`, and `base64`. If not specified, the encoding is the same as the containing JSON document.
   * Without getting into the low-level details of each of these encodings, there are really only two options useful for modern usage:
   * -   If the content is encoded in the same encoding as the enclosing JSON document (which for practical purposes, is almost always UTF-8), leave `contentEncoding` unspecified, and include the content in a string as-is. This includes text-based content types, such as `text/html` or `application/xml`.
   * -   If the content is binary data, set `contentEncoding` to `base64` and encode the contents using [Base64](https://tools.ietf.org/html/rfc4648). This would include many image types, such as `image/png` or audio types, such as `audio/mpeg`.
   */
  contentEncoding?: string;
  contentSchema?: SCHEMA;
}

export interface NumberSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "number" | "integer";
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export interface BooleanSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "boolean";
}

export interface NullSchema<SCHEMA extends AllSchemas = AllSchemas> extends CommonSchema<SCHEMA> {
  type: "null";
}

export type AllSchemas =
  | EnumSchema
  | ConstSchema
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | NullSchema
  | boolean
  | CommonSchema;

/**
 * Json schema 2020-12
 *unde
 * For explanations and examples see
 * https://json-schema.org/understanding-json-schema
 * https://opis.io/json-schema/
 */
export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
} & AllSchemas;

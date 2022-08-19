/**
 * This is the root object of the OpenAPI document.
 */
interface OpenApiSchema {
  /**
   * REQUIRED. This string MUST be the version number of the OpenAPI Specification that the OpenAPI document uses. The openapi field SHOULD be used by tooling to interpret the OpenAPI document. This is not related to the API info.version string.
   */
  openapi: string

  /**
   * REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required.
   */
  info: Info

  /**
   * The default value for the $schema keyword within Schema Objects contained within this OAS document. This MUST be in the form of a URI.
   */
  jsonSchemaDialect?: string

  /**
   * An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /.
   */
  servers?: Server[]

  /**
   * The available paths and operations for the API.
   */
  paths?: Paths
}

/**
 * The object provides metadata about the API. The metadata MAY be used by the clients if needed, and MAY be presented in editing or documentation generation tools for convenience.
 */
interface Info {
  /**
   * REQUIRED. The title of the API.
   */
  title: string

  /**
   * A short summary of the API.
   */
  summary?: string

  /**
   * A description of the API. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * A URL to the Terms of Service for the API. This MUST be in the form of a URL.
   */
  termsOfService?: string

  /**
   * The contact information for the exposed API.
   */
  contact?: Contact

  /**
   * The license information for the exposed API.
   */
  license?: License

  /**
   * REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
   */
  version: string
}

/**
 * Contact information for the exposed API.
 */
interface Contact {
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string

  /**
   * The URL pointing to the contact information. This MUST be in the form of a URL.
   */
  url?: string

  /**
   * The email address of the contact person/organization. This MUST be in the form of an email address.
   */
  email?: string
}

/**
 * License information for the exposed API.
 */
interface License {
  /**
   * REQUIRED. The license name used for the API.
   */
  name: string

  /**
   * An SPDX license expression for the API. The identifier field is mutually exclusive of the url field.
   */
  identifier?: string

  /**
   * A URL to the license used for the API. This MUST be in the form of a URL. The url field is mutually exclusive of the identifier field.
   */
  url?: string
}

/**
 * An object representing a Server.
 */
interface Server {
  /**
   * REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}.
   */
  url: string

  /**
   * An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * A map between a variable name and its value. The value is used for substitution in the server's URL template.
   */
  variables?: Record<string, ServerVariable>
}

/**
 * An object representing a Server Variable for server URL template substitution.
 */
interface ServerVariable {
  /**
   * An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty.
   */
  enum?: string[]

  /**
   * REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value MUST exist in the enum's values.
   */
  default: string

  /**
   * An optional description for the server variable. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string
}

/**
 * Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the Server Object in order to construct the full URL. The Paths MAY be empty, due to Access Control List (ACL) constraints.
 */
interface Paths {
  /**
   * A relative path to an individual endpoint. The field name MUST begin with a forward slash (/). The path is appended (no relative URL resolution) to the expanded URL from the Server Object's url field in order to construct the full URL. Path templating is allowed. When matching URLs, concrete (non-templated) paths would be matched before their templated counterparts. Templated paths with the same hierarchy but different templated names MUST NOT exist as they are identical. In case of ambiguous matching, it's up to the tooling to decide which one to use.
   */
  [path: `/${string}`]: PathItem
}

/**
 * Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 */
interface PathItem {
  /**
   * Allows for a referenced definition of this path item. The referenced structure MUST be in the form of a Path Item Object. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving Relative References.
   */
  $ref?: string

  /**
   * An optional, string summary, intended to apply to all operations in this path.
   */
  summary?: string

  /**
   * An optional, string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * A definition of a GET operation on this path.
   */
  get?: Operation

  /**
   * A definition of a PUT operation on this path.
   */
  put?: Operation

  /**
   * A definition of a POST operation on this path.
   */
  post?: Operation

  /**
   * A definition of a DELETE operation on this path.
   */
  delete?: Operation

  /**
   * A definition of a OPTIONS operation on this path.
   */
  options?: Operation

  /**
   * A definition of a HEAD operation on this path.
   */
  head?: Operation

  /**
   * A definition of a PATCH operation on this path.
   */
  patch?: Operation

  /**
   * A definition of a TRACE operation on this path.
   */
  trace?: Operation

  /**
   * An alternative server array to service all operations in this path.
   */
  servers?: Server[]

  /**
   * A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters.
   */
  parameters?: (Parameter | Reference)[]
}

/**
 * Describes a single API operation on a path.
 */
interface Operation {
  /**
   * A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier.
   */
  tags?: [string]

  /**
   * A short summary of what the operation does.
   */
  summary?: string

  /**
   * A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: ExternalDocumentation

  /**
   * Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
   */
  operationId?: string

  /**
   * A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters.
   */
  parameters?: (Parameter | Reference)[]

  /**
   * The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification RFC7231 has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible.
   */
  requestBody?: RequestBody | Reference

  /**
   * The list of possible responses as they are returned from executing this operation.
   */
  responses?: Responses

  /**
   * A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses.
   */
  callbacks?: Record<string, Callback | Reference>

  /**
   * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false.
   */
  deprecated?: boolean

  /**
   * A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement ({}) can be included in the array. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used.
   */
  security?: SecurityRequirement[]

  /**
   * An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value.
   */
  servers?: Server[]
}

/**
 * Allows referencing an external resource for extended documentation.
 */
interface ExternalDocumentation {
  /**
   * A description of the target documentation. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * REQUIRED. The URL for the target documentation. This MUST be in the form of a URL.
   */
  url: string
}

/**
 * Describes a single operation parameter.
 *
 * A unique parameter is defined by a combination of a name and location.
 * Parameter Locations
 *
 * There are four possible parameter locations specified by the in field:
 *
 *     + path - Used together with Path Templating, where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in /items/{itemId}, the path parameter is itemId.
 *     + query - Parameters that are appended to the URL. For example, in /items?id=###, the query parameter is id.
 *     + header - Custom headers that are expected as part of the request. Note that RFC7230 states header names are case insensitive.
 *     + cookie - Used to pass a specific cookie value to the API.
 */
interface Parameter {
  /**
   * REQUIRED. The name of the parameter. Parameter names are case sensitive.
   If in is "path", the name field MUST correspond to a template expression occurring within the path field in the Paths Object. See Path Templating for further information.
   If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored.
   For all other cases, the name corresponds to the parameter name used by the in property.
   */
  name: string

  /**
   * REQUIRED. The location of the parameter. Possible values are "query", "header", "path" or "cookie".
   */
  in: string

  /**
   * A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
   */
  required: boolean

  /**
   * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
   */
  deprecated?: boolean

  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
   */
  allowEmptyValue?: boolean
}

/**
 * A simple object to allow referencing other components in the OpenAPI document, internally and externally.
 *
 * The $ref string value contains a URI RFC3986, which identifies the location of the value being referenced.
 *
 * See the rules for resolving Relative References.
 */
interface Reference {
  /**
   * REQUIRED. The reference identifier. This MUST be in the form of a URI.
   */
  $ref: string

  /**
   * A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect.
   */
  summary?: string

  /**
   * A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect.
   */
  description?: string
}

/**
 * Describes a single request body.
 */
interface RequestBody {
  /**
   * A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * REQUIRED. The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
   */
  content: Record<string, MediaType>

  /**
   * Determines if the request body is required in the request. Defaults to false.
   */
  required?: boolean
}

/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 */
interface MediaType {
  /**
   * The schema defining the content of the request, response, or parameter.
   */
  schema?: Schema

  /**
   * Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema.
   */
  example?: any

  /**
   * Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema.
   */
  examples?: Record<string, Example | Reference>

  /**
   * A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
   */
  encoding?: Record<string, Encoding>
}

interface Example {
  /**
   * Short description for the example.
   */
  summary?: string

  /**
   * Long description for the example. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary.
   */
  value?: any

  /**
   * A URI that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive. See the rules for resolving Relative References.
   */
  externalValue?: string
}

/**
 * A single encoding definition applied to a single schema property.
 */
interface Encoding {
  /**
   * The Content-Type for encoding a specific property. Default value depends on the property type: for object - application/json; for array – the default is defined based on the inner type; for all other cases the default is application/octet-stream. The value can be a specific media type (e.g. application/json), a wildcard media type (e.g. image/*), or a comma-separated list of the two types.
   */
  contentType?: string

  /**
   * A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart.
   */
  headers?: Record<string, Header | Reference>

  /**
   * Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  style?: string

  /**
   * When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  explode?: boolean

  /**
   * Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  allowReserved?: boolean
}

/**
 * The Header Object follows the structure of the Parameter Object with the following changes:
 *
 *     + name MUST NOT be specified, it is given in the corresponding headers map.
 *     + in MUST NOT be specified, it is implicitly in header.
 *     + All traits that are affected by the location MUST be applicable to a location of header (for example, style).
 *
 * Header Object Example
 *
 * A simple header of type integer:
 * ```json
 * {
 *   "description": "The number of allowed requests in the current period",
 *   "schema": {
 *     "type": "integer"
 *   }
 * }
 * ```
 *
 * ```yaml
 * description: The number of allowed requests in the current period
 * schema:
 *   type: integer
 * ```
 */
interface Header {
  /**
   * A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
   */
  required: boolean

  /**
   * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
   */
  deprecated?: boolean

  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
   */
  allowEmptyValue?: boolean
}

type HttpStatusCodes =
  | "100"
  | "101"
  | "102"
  | "103"
  | "200"
  | "201"
  | "202"
  | "203"
  | "204"
  | "205"
  | "206"
  | "207"
  | "208"
  | "226"
  | "300"
  | "301"
  | "302"
  | "303"
  | "304"
  | "305"
  | "306"
  | "307"
  | "308"
  | "400"
  | "401"
  | "402"
  | "403"
  | "404"
  | "405"
  | "406"
  | "407"
  | "408"
  | "409"
  | "410"
  | "411"
  | "412"
  | "413"
  | "414"
  | "415"
  | "416"
  | "417"
  | "418"
  | "421"
  | "422"
  | "423"
  | "424"
  | "425"
  | "426"
  | "428"
  | "429"
  | "431"
  | "451"
  | "500"
  | "501"
  | "502"
  | "503"
  | "504"
  | "505"
  | "506"
  | "507"
  | "508"
  | "510"
  | "511"

/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 *
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 *
 * The default MAY be used as a default response object for all HTTP codes that are not covered individually by the Responses Object.
 *
 * The Responses Object MUST contain at least one response code, and if only one response code is provided it SHOULD be the response for a successful operation call.
 */
type Responses = {
  /**
   * The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses.
   */
  default?: Response | Reference
} & /**
 * Any HTTP status code can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character X. For example, 2XX represents all response codes between [200-299]. Only the following range definitions are allowed: 1XX, 2XX, 3XX, 4XX, and 5XX. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code.
 */ Partial<Record<HttpStatusCodes, Response | Reference>>

/**
 * Describes a single response from an API Operation, including design-time, static links to operations based on the response.
 */
interface Response {
  /**
   * REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation.
   */
  description: string

  /**
   * Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored.
   */
  headers?: Record<string, Header | Reference>

  /**
   * A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
   */
  content?: Record<string, MediaType>

  /**
   * A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects.
   */
  links?: Record<string, Link | Reference>
}

interface Link {
  /**
   * A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition. See the rules for resolving Relative References.
   */
  operationRef?: string

  /**
   * The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field.
   */
  operationId?: string

  /**
   * A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id).
   */
  parameters?: Record<string, any>

  /**
   * A literal value or {expression} to use as a request body when calling the target operation.
   */
  requestBody?: any

  /**
   * A description of the link. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string

  /**
   * A server object to be used by the target operation.
   */
  server?: Server
}

/**
 * A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
 *
 * To describe incoming requests from the API provider independent from another API call, use the webhooks field.
 */
interface Callback {
  /**
   * A Path Item Object, or a reference to one, used to define a callback request and expected responses. A complete example is available.
   */
  [key: string]: PathItem | Reference
}

/**
 * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
 *
 * Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.
 *
 * When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
 */
interface SecurityRequirement {
  /**
   * Each name MUST correspond to a security scheme which is declared in the Security Schemes under the Components Object. If the security scheme is of type "oauth2" or "openIdConnect", then the value is a list of scope names required for the execution, and the list MAY be empty if authorization does not require a specified scope. For other security scheme types, the array MAY contain a list of role names which are required for the execution, but are not otherwise defined or exchanged in-band.
   */
  [name: string]: [string]
}

import { AllSchemas } from "./json-schema-2020-12";

export type OpenApiVersions = "3.1.0" | "3.0.3" | "3.0.2" | "3.0.1" | "3.0.0";

/**
 * This is the root object of the OpenAPI document.
 */
export interface OpenApiSchema {
  /**
   * REQUIRED. This string MUST be the version number of the OpenAPI Specification that the OpenAPI document uses. The openapi field SHOULD be used by tooling to interpret the OpenAPI document. This is not related to the API info.version string.
   */
  openapi: OpenApiVersions;

  /**
   * REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required.
   */
  info: Info;

  /**
   * The default value for the $schema keyword within Schema Objects contained within this OAS document. This MUST be in the form of a URI.
   */
  jsonSchemaDialect?: string;

  /**
   * An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /.
   */
  servers?: Server[];

  /**
   * The available paths and operations for the API.
   */
  paths?: Paths;

  /**
   * The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the callbacks feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An example is available.
   */
  webhooks?: Record<string, PathItem | Reference>;

  /**
   * An element to hold various schemas for the document.
   */
  components?: Components;

  /**
   * A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
   */
  security?: SecurityRequirement[];

  /**
   * A list of tags used by the document with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique.
   */
  tags?: Tag[];

  /**
   * Additional external documentation.
   */
  externalDocs?: ExternalDocumentation;
}

/**
 * The object provides metadata about the API. The metadata MAY be used by the clients if needed, and MAY be presented in editing or documentation generation tools for convenience.
 */
export interface Info {
  /**
   * REQUIRED. The title of the API.
   */
  title: string;

  /**
   * A short summary of the API.
   */
  summary?: string;

  /**
   * A description of the API. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * A URL to the Terms of Service for the API. This MUST be in the form of a URL.
   */
  termsOfService?: string;

  /**
   * The contact information for the exposed API.
   */
  contact?: Contact;

  /**
   * The license information for the exposed API.
   */
  license?: License;

  /**
   * REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
   */
  version: string;
}

/**
 * Contact information for the exposed API.
 */
export interface Contact {
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string;

  /**
   * The URL pointing to the contact information. This MUST be in the form of a URL.
   */
  url?: string;

  /**
   * The email address of the contact person/organization. This MUST be in the form of an email address.
   */
  email?: string;
}

/**
 * License information for the exposed API.
 */
export interface License {
  /**
   * REQUIRED. The license name used for the API.
   */
  name: string;

  /**
   * An SPDX license expression for the API. The identifier field is mutually exclusive of the url field.
   */
  identifier?: string;

  /**
   * A URL to the license used for the API. This MUST be in the form of a URL. The url field is mutually exclusive of the identifier field.
   */
  url?: string;
}

/**
 * An object representing a Server.
 */
export interface Server {
  /**
   * REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}.
   */
  url: string;

  /**
   * An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * A map between a variable name and its value. The value is used for substitution in the server's URL template.
   */
  variables?: Record<string, ServerVariable>;
}

/**
 * An object representing a Server Variable for server URL template substitution.
 */
export interface ServerVariable {
  /**
   * An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty.
   */
  enum?: string[];

  /**
   * REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value MUST exist in the enum's values.
   */
  default: string;

  /**
   * An optional description for the server variable. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;
}

/**
 * Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the Server Object in order to construct the full URL. The Paths MAY be empty, due to Access Control List (ACL) constraints.
 */
export interface Paths {
  /**
   * A relative path to an individual endpoint. The field name MUST begin with a forward slash (/). The path is appended (no relative URL resolution) to the expanded URL from the Server Object's url field in order to construct the full URL. Path templating is allowed. When matching URLs, concrete (non-templated) paths would be matched before their templated counterparts. Templated paths with the same hierarchy but different templated names MUST NOT exist as they are identical. In case of ambiguous matching, it's up to the tooling to decide which one to use.
   */
  [path: `/${string}`]: PathItem;
}

/**
 * Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 */
export interface PathItem {
  /**
   * Allows for a referenced definition of this path item. The referenced structure MUST be in the form of a Path Item Object. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving Relative References.
   */
  $ref?: string;

  /**
   * An optional, string summary, intended to apply to all operations in this path.
   */
  summary?: string;

  /**
   * An optional, string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * A definition of a GET operation on this path.
   */
  get?: Operation;

  /**
   * A definition of a PUT operation on this path.
   */
  put?: Operation;

  /**
   * A definition of a POST operation on this path.
   */
  post?: Operation;

  /**
   * A definition of a DELETE operation on this path.
   */
  delete?: Operation;

  /**
   * A definition of a OPTIONS operation on this path.
   */
  options?: Operation;

  /**
   * A definition of a HEAD operation on this path.
   */
  head?: Operation;

  /**
   * A definition of a PATCH operation on this path.
   */
  patch?: Operation;

  /**
   * A definition of a TRACE operation on this path.
   */
  trace?: Operation;

  /**
   * An alternative server array to service all operations in this path.
   */
  servers?: Server[];

  /**
   * A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters.
   */
  parameters?: (Parameter | Reference)[];
}

/**
 * Describes a single API operation on a path.
 */
export interface Operation {
  /**
   * A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier.
   */
  tags?: string[];

  /**
   * A short summary of what the operation does.
   */
  summary?: string;

  /**
   * A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: ExternalDocumentation;

  /**
   * Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
   */
  operationId?: string;

  /**
   * A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object's components/parameters.
   */
  parameters?: (Parameter | Reference)[];

  /**
   * The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification RFC7231 has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible.
   */
  requestBody?: RequestBody | Reference;

  /**
   * The list of possible responses as they are returned from executing this operation.
   */
  responses?: Responses;

  /**
   * A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses.
   */
  callbacks?: Record<string, Callback | Reference>;

  /**
   * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false.
   */
  deprecated?: boolean;

  /**
   * A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement ({}) can be included in the array. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used.
   */
  security?: SecurityRequirement[];

  /**
   * An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value.
   */
  servers?: Server[];
}

/**
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocumentation {
  /**
   * A description of the target documentation. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * REQUIRED. The URL for the target documentation. This MUST be in the form of a URL.
   */
  url: string;
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
export interface Parameter {
  /**
   * REQUIRED. The name of the parameter. Parameter names are case sensitive.
   If in is "path", the name field MUST correspond to a template expression occurring within the path field in the Paths Object. See Path Templating for further information.
   If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored.
   For all other cases, the name corresponds to the parameter name used by the in property.
   */
  name: string;

  /**
   * REQUIRED. The location of the parameter. Possible values are "query", "header", "path" or "cookie".
   */
  in: "query" | "header" | "path" | "cookie";

  /**
   * A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
   */
  required: boolean;

  /**
   * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
   */
  deprecated?: boolean;

  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
   */
  allowEmptyValue?: boolean;

  /**
   * Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form.
   */
  style?: string;

  /**
   * When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When style is form, the default value is true. For all other styles, the default value is false.
   */
  explode?: boolean;

  /**
   * Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. This property only applies to parameters with an in value of query. The default value is false.
   */
  allowReserved?: boolean;

  /**
   * The schema defining the type used for the parameter.
   */
  schema?: Schema;

  /**
   * Example of the parameter's potential value. The example SHOULD match the specified schema and encoding properties if present. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema that contains an example, the example value SHALL override the example provided by the schema. To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary.
   */
  example?: any;

  /**
   * Examples of the parameter's potential value. Each example SHOULD contain a value in the correct format as specified in the parameter encoding. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema that contains an example, the examples value SHALL override the example provided by the schema.
   */
  examples?: Record<string, Example | Reference>;

  /**
   * A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry.
   */
  content?: Record<string, MediaType>;
}

/**
 * A simple object to allow referencing other components in the OpenAPI document, internally and externally.
 *
 * The $ref string value contains a URI RFC3986, which identifies the location of the value being referenced.
 *
 * See the rules for resolving Relative References.
 */
export interface Reference {
  /**
   * REQUIRED. The reference identifier. This MUST be in the form of a URI.
   */
  $ref: string;

  /**
   * A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect.
   */
  summary?: string;

  /**
   * A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect.
   */
  description?: string;
}

/**
 * Describes a single request body.
 */
export interface RequestBody {
  /**
   * A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * REQUIRED. The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
   */
  content: Record<string, MediaType>;

  /**
   * Determines if the request body is required in the request. Defaults to false.
   */
  required?: boolean;
}

/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 */
export interface MediaType {
  /**
   * The schema defining the content of the request, response, or parameter.
   */
  schema?: Schema;

  /**
   * Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema.
   */
  example?: any;

  /**
   * Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema.
   */
  examples?: Record<string, Example | Reference>;

  /**
   * A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
   */
  encoding?: Record<string, Encoding>;
}

export interface Example {
  /**
   * Short description for the example.
   */
  summary?: string;

  /**
   * Long description for the example. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary.
   */
  value?: any;

  /**
   * A URI that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive. See the rules for resolving Relative References.
   */
  externalValue?: string;
}

/**
 * A single encoding definition applied to a single schema property.
 */
export interface Encoding {
  /**
   * The Content-Type for encoding a specific property. Default value depends on the property type: for object - application/json; for array – the default is defined based on the inner type; for all other cases the default is application/octet-stream. The value can be a specific media type (e.g. application/json), a wildcard media type (e.g. image/*), or a comma-separated list of the two types.
   */
  contentType?: string;

  /**
   * A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart.
   */
  headers?: Record<string, Header | Reference>;

  /**
   * Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  style?: string;

  /**
   * When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  explode?: boolean;

  /**
   * Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
   */
  allowReserved?: boolean;
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
export interface Header {
  /**
   * A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
   */
  required: boolean;

  /**
   * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
   */
  deprecated?: boolean;

  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
   */
  allowEmptyValue?: boolean;
}

export type HttpStatusCodes =
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
  | "511";

/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 *
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 *
 * The default MAY be used as a default response object for all HTTP codes that are not covered individually by the Responses Object.
 *
 * The Responses Object MUST contain at least one response code, and if only one response code is provided it SHOULD be the response for a successful operation call.
 */
export type Responses = {
  /**
   * The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses.
   */
  default?: Response | Reference;
} & /**
 * Any HTTP status code can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character X. For example, 2XX represents all response codes between [200-299]. Only the following range definitions are allowed: 1XX, 2XX, 3XX, 4XX, and 5XX. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code.
 */ Partial<Record<HttpStatusCodes, Response | Reference>>;

/**
 * Describes a single response from an API Operation, including design-time, static links to operations based on the response.
 */
export interface Response {
  /**
   * REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation.
   */
  description: string;

  /**
   * Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored.
   */
  headers?: Record<string, Header | Reference>;

  /**
   * A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
   */
  content?: Record<string, MediaType>;

  /**
   * A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects.
   */
  links?: Record<string, Link | Reference>;
}

export interface Link {
  /**
   * A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition. See the rules for resolving Relative References.
   */
  operationRef?: string;

  /**
   * The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field.
   */
  operationId?: string;

  /**
   * A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id).
   */
  parameters?: Record<string, any>;

  /**
   * A literal value or {expression} to use as a request body when calling the target operation.
   */
  requestBody?: any;

  /**
   * A description of the link. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * A server object to be used by the target operation.
   */
  server?: Server;
}

/**
 * A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
 *
 * To describe incoming requests from the API provider independent from another API call, use the webhooks field.
 */
export interface Callback {
  /**
   * A Path Item Object, or a reference to one, used to define a callback request and expected responses. A complete example is available.
   */
  [key: string]: PathItem | Reference;
}

/**
 * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
 *
 * Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.
 *
 * When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
 */
export interface SecurityRequirement {
  /**
   * Each name MUST correspond to a security scheme which is declared in the Security Schemes under the Components Object. If the security scheme is of type "oauth2" or "openIdConnect", then the value is a list of scope names required for the execution, and the list MAY be empty if authorization does not require a specified scope. For other security scheme types, the array MAY contain a list of role names which are required for the execution, but are not otherwise defined or exchanged in-band.
   */
  [name: string]: string[];
}

/**
 * Holds a set of reusable objects for different aspects of the OAS. All objects defined within the components object will have no effect on the API unless they are explicitly referenced from properties outside the components object.
 */
export interface Components {
  /**
   * An object to hold reusable Schema Objects.
   */
  schemas?: Record<string, Schema>;

  /**
   * An object to hold reusable Response Objects.
   */
  responses?: Record<string, Response | Reference>;

  /**
   * An object to hold reusable Parameter Objects.
   */
  parameters?: Record<string, Parameter | Reference>;

  /**
   * An object to hold reusable Example Objects.
   */
  examples?: Record<string, Example | Reference>;

  /**
   * An object to hold reusable Request Body Objects.
   */
  requestBodies?: Record<string, RequestBody | Reference>;

  /**
   * An object to hold reusable Header Objects.
   */
  headers?: Record<string, Header | Reference>;

  /**
   * An object to hold reusable Security Scheme Objects.
   */
  securitySchemes?: Record<string, SecurityScheme | Reference>;

  /**
   * An object to hold reusable Link Objects.
   */
  links?: Record<string, Link | Reference>;

  /**
   * An object to hold reusable Callback Objects.
   */
  callbacks?: Record<string, Callback | Reference>;

  /**
   * An object to hold reusable Path Item Object.
   */
  pathItems?: Record<string, PathItem | Reference>;
}

/**
 * Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.
 */
export interface Tag {
  /**
   * REQUIRED. The name of the tag.
   */
  name: string;

  /**
   * A description for the tag. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Additional external documentation for this tag.
   */
  externalDocs?: ExternalDocumentation;
}

/**
 * Defines a security scheme that can be used by the operations.
 *
 * Supported schemes are HTTP authentication, an API key (either as a header, a cookie parameter or as a query parameter), mutual TLS (use of a client certificate), OAuth2's common flows (implicit, password, client credentials and authorization code) as defined in RFC6749, and OpenID Connect Discovery. Please note that as of 2020, the implicit flow is about to be deprecated by OAuth 2.0 Security Best Current Practice. Recommended for most use case is Authorization Code Grant flow with PKCE.
 */
export interface SecurityScheme {
  /**
   * REQUIRED. The type of the security scheme. Valid values are "apiKey", "http", "mutualTLS", "oauth2", "openIdConnect".
   * Applies to: Any
   */
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";

  /**
   * A description for security scheme. CommonMark syntax MAY be used for rich text representation.
   * Applies to: Any
   */
  description?: string;

  /**
   * REQUIRED. The name of the header, query or cookie parameter to be used.
   * Applies to: apiKey
   */
  name?: string;

  /**
   * REQUIRED. The location of the API key. Valid values are "query", "header" or "cookie".
   * Applies to: apiKey
   */
  in?: "query" | "header" | "cookie";

  /**
   * REQUIRED. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in RFC7235. The values used SHOULD be registered in the IANA Authentication Scheme registry.
   * Applies to: http
   */
  scheme?: string;

  /**
   * A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes.
   * Applies to: http ("bearer")
   */
  bearerFormat?: string;

  /**
   * REQUIRED. An object containing configuration information for the flow types supported.
   * Applies to: oauth2
   */
  flows?: OAuthFlows;

  /**
   * REQUIRED. OpenId Connect URL to discover OAuth2 configuration values. This MUST be in the form of a URL. The OpenID Connect standard requires the use of TLS.
   * Applies to: openIdConnect
   */
  openIdConnectUrl?: string;
}

/**
 * Allows configuration of the supported OAuth Flows.
 */
export interface OAuthFlows {
  /**
   * Configuration for the OAuth Implicit flow
   */
  implicit?: OAuthFlow;

  /**
   * Configuration for the OAuth Resource Owner Password flow
   */
  password?: OAuthFlow;

  /**
   * Configuration for the OAuth Client Credentials flow. Previously called application in OpenAPI 2.0.
   */
  clientCredentials?: OAuthFlow;

  /**
   * Configuration for the OAuth Authorization Code flow. Previously called accessCode in OpenAPI 2.0.
   */
  authorizationCode?: OAuthFlow;
}

/**
 * Configuration details for a supported OAuth Flow
 */
export interface OAuthFlow {
  /**
   * REQUIRED. The authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
   * Applies to: oauth2 ("implicit", "authorizationCode")
   */
  authorizationUrl: string;

  /**
   * REQUIRED. The token URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
   * Applies to: oauth2 ("password", "clientCredentials", "authorizationCode")
   */
  tokenUrl: string;

  /**
   * The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
   * Applies to: oauth2
   */
  refreshUrl?: string;

  /**
   * REQUIRED. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty.
   * Applies to: oauth2
   */
  scopes: Record<string, string>;
}

export interface SpecificationExtension {
  [extensionName: `x-${string}`]: any;
}

/**
 * When request bodies or response payloads may be one of a number of different schemas, a discriminator object can be used to aid in serialization, deserialization, and validation. The discriminator is a specific object in a schema which is used to inform the consumer of the document of an alternative schema based on the value associated with it.
 *
 * When using the discriminator, inline schemas will not be considered.
 */
export interface Discriminator extends SpecificationExtension {
  /**
   * REQUIRED. The name of the property in the payload that will hold the discriminator value.
   */
  propertyName: string;

  /**
   * An object to hold mappings between payload values and schema names or references.
   */
  mapping?: Record<string, string>;
}

/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 *
 * When using arrays, XML element names are not inferred (for singular/plural forms) and the name property SHOULD be used to add that information. See examples for expected behavior.
 */
export interface XML extends SpecificationExtension {
  /**
   * Replaces the name of the element/attribute used for the described schema property. When defined within items, it will affect the name of the individual XML elements within the list. When defined alongside type being array (outside the items), it will affect the wrapping element and only if wrapped is true. If wrapped is false, it will be ignored.
   */
  name?: string;

  /**
   * The URI of the namespace definition. This MUST be in the form of an absolute URI.
   */
  namespace?: string;

  /**
   * The prefix to be used for the name.
   */
  prefix?: string;

  /**
   * Declares whether the property definition translates to an attribute instead of an element. Default value is false.
   */
  attribute?: boolean;

  /**
   * MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>). Default value is false. The definition takes effect only when defined alongside type being array (outside the items).
   */
  wrapped?: boolean;
}

/**
 * The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is a superset of the JSON Schema Specification Draft 2020-12.
 *
 * For more information about the properties, see JSON Schema Core and JSON Schema Validation.
 *
 * Unless stated otherwise, the property definitions follow those of JSON Schema and do not add any additional semantics. Where JSON Schema indicates that behavior is defined by the application (e.g. for annotations), OAS also defers the definition of semantics to the application consuming the OpenAPI document.
 * Properties
 *
 * The OpenAPI Schema Object dialect is defined as requiring the OAS base vocabulary, in addition to the vocabularies as specified in the JSON Schema draft 2020-12 general purpose meta-schema.
 *
 * The OpenAPI Schema Object dialect for this version of the specification is identified by the URI https://spec.openapis.org/oas/3.1/dialect/base (the "OAS dialect schema id").
 *
 * The following properties are taken from the JSON Schema specification but their definitions have been extended by the OAS:
 *
 *     description - CommonMark syntax MAY be used for rich text representation.
 *     format - See Data Type Formats for further details. While relying on JSON Schema's defined formats, the OAS offers a few additional predefined formats.
 *
 * In addition to the JSON Schema properties comprising the OAS dialect, the Schema Object supports keywords from any other vocabularies, or entirely arbitrary properties.
 *
 * The OpenAPI Specification's base vocabulary is comprised of the following keywords:
 */
export type OpenApiSchemaExtensions = {
  /**
   * Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas which may satisfy the payload description. See Composition and Inheritance for more details.
   */
  discriminator?: Discriminator;

  /**
   * This MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property.
   */
  xml?: XML;

  /**
   * Additional external documentation for this schema.
   */
  externalDocs?: ExternalDocumentation;

  /**
   * A free-form property to include an example of an instance for this schema. To represent examples that cannot be naturally represented in JSON or YAML, a string value can be used to contain the example with escaping where necessary.

   Deprecated: The example property has been deprecated in favor of the JSON Schema examples keyword. Use of example is discouraged, and later versions of this specification may remove it.
   @deprecated
   */
  example?: any;
};

export type Schema = AllSchemas;

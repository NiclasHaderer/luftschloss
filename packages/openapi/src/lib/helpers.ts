import { mergeIn } from "@luftschloss/common"
import { generateJsonSchema, OpenApiSchema, Parameter, Reference } from "@luftschloss/openapi-schema"
import { HTTP_METHODS } from "@luftschloss/server"
import { LuftObject, LuftType } from "@luftschloss/validation"
import { CollectedRoute } from "./api.route"

export const addRouteToOpenApi = (openApi: OpenApiSchema, route: CollectedRoute) => {
  if (openApi.paths === undefined) {
    openApi.paths = {}
  }

  let bodySchema = route.validator.body ? generateJsonSchema(route.validator.body) : undefined
  let responseSchema = route.validator.response ? generateJsonSchema(route.validator.response) : undefined

  if (!openApi.paths[route.path]) {
    openApi.paths[route.path] = {}
  }

  openApi.paths[route.path][route.method.toLowerCase() as Lowercase<HTTP_METHODS>] = {}
  const apiRoute = openApi.paths[route.path][route.method.toLowerCase() as Lowercase<HTTP_METHODS>]!
  apiRoute.parameters = [
    ...getParameters(route.validator.path, "path"),
    ...getParameters(route.validator.query, "query"),
    ...getParameters(route.validator.headers, "header"),
  ]

  apiRoute.responses = {}
  if (!responseSchema) {
    apiRoute.responses["204"] = { description: "empty" }
  } else {
    if (route.validator.response?.validationStorage?.name && responseSchema) {
      openApi.components = openApi.components || {}
      openApi.components.schemas = openApi.components.schemas || {}
      openApi.components.schemas[route.validator.response.validationStorage.name] = responseSchema
      bodySchema = { $ref: `#/components/schemas/${route.validator.response.validationStorage.name}` }
    }

    apiRoute.responses.default = {
      description: route.validator.response?.validationStorage.description ?? "",
      content: {
        "application/json": {
          schema: responseSchema,
        },
      },
    }
  }

  if (bodySchema) {
    if (route.validator.body?.validationStorage?.name && bodySchema) {
      openApi.components = openApi.components || {}
      openApi.components.schemas = openApi.components.schemas || {}
      openApi.components.schemas[route.validator.body.validationStorage.name] = bodySchema
      responseSchema = { $ref: `#/components/schemas/${route.validator.body.validationStorage.name}` }
    }

    apiRoute.requestBody = {
      content: {
        "application/json": {
          schema: bodySchema,
        },
      },
    }
  }

  mergeIn(apiRoute, route.info)
}

const getParameters = (
  validator: LuftObject<Record<string, LuftType>> | undefined,
  position: "path" | "header" | "query"
): (Parameter | Reference)[] => {
  return Object.entries(validator?.schema?.type || {}).map(([name, value]) => ({
    name: value.validationStorage.name ? value.validationStorage.name : name,
    schema: generateJsonSchema(value),
    in: position,
    required: !value.validationStorage.default.isSet,
    deprecated: value.validationStorage.deprecated,
    description: value.validationStorage.description,
  }))
}

import { CollectedRoute } from "./api.route"
import { generateJsonSchema, OpenApiSchema, Parameter, Reference } from "@luftschloss/openapi-schema"
import { HTTP_METHODS } from "@luftschloss/server"
import { LuftObject, LuftType } from "@luftschloss/validation"

export const addRouteToOpenApi = (openApi: OpenApiSchema, route: CollectedRoute) => {
  if (openApi.paths === undefined) {
    openApi.paths = {}
  }

  const bodySchema = route.validator.body ? generateJsonSchema(route.validator.body) : undefined
  const responseSchema = route.validator.response ? generateJsonSchema(route.validator.response) : undefined

  if (!openApi.paths[route.url]) {
    openApi.paths[route.url] = {}
  }

  openApi.paths[route.url][route.method.toLowerCase() as Lowercase<HTTP_METHODS>] = {}
  const apiRoute = openApi.paths[route.url][route.method.toLowerCase() as Lowercase<HTTP_METHODS>]!
  apiRoute.parameters = [
    ...getParameters(route.validator.path, "path"),
    ...getParameters(route.validator.query, "query"),
    ...getParameters(route.validator.headers, "header"),
  ]

  apiRoute.responses = {}
  if (!responseSchema) {
    apiRoute.responses["204"] = { description: "empty" }
  } else {
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
    apiRoute.requestBody = {
      content: {
        "application/json": {
          schema: bodySchema,
        },
      },
    }
  }
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

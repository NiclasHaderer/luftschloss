import { mergeIn } from "@luftschloss/common";
import {
  AllSchemas,
  generateJsonSchema,
  HttpStatusCodes,
  OpenApiSchema,
  Parameter,
  Reference,
} from "@luftschloss/openapi-schema";
import { HTTP_METHODS } from "@luftschloss/server";
import { LuftObject, LuftType, LuftUnion } from "@luftschloss/validation";
import { CollectedRoute } from "./api.route";

const SCHEMA_PATH = "#/components/schemas/";

const MOCK_UNSET = Symbol("MOCK_UNSET");
let MOCK: Awaited<Promise<typeof import("@luftschloss/mocking")> | undefined | typeof MOCK_UNSET> = MOCK_UNSET;

const getMockingFactory = async () => {
  if (MOCK !== MOCK_UNSET) return MOCK;
  MOCK = await import("@luftschloss/mocking").catch(() => undefined);
  return MOCK;
};

export const addRouteToOpenApi = async (openApi: OpenApiSchema, route: CollectedRoute) => {
  const mocking = await getMockingFactory();

  // Add paths
  openApi.paths = openApi.paths ?? {};
  // Add components and the schema key
  openApi.components = openApi.components ?? {};
  openApi.components.schemas = openApi.components.schemas ?? {};

  // Add this specific path
  openApi.paths[route.path] = openApi.paths[route.path] ?? {};

  openApi.paths[route.path][route.method.toLowerCase() as Lowercase<HTTP_METHODS>] = {};
  const apiRoute = openApi.paths[route.path][route.method.toLowerCase() as Lowercase<HTTP_METHODS>]!;

  // Get url and header parameters
  const pathParams = getParameters(route.validator.path, "path");
  const queryParams = getParameters(route.validator.query, "query");
  const headerParams = getParameters(route.validator.headers, "header");

  // Set url and header parameter schemas
  openApi.components.schemas = {
    ...openApi.components.schemas,
    ...pathParams.reduce(
      (acc, { subSchemas }) => ({
        ...acc,
        ...subSchemas,
      }),
      {} as { [key: string]: AllSchemas }
    ),
    ...queryParams.reduce(
      (acc, { subSchemas }) => ({
        ...acc,
        ...subSchemas,
      }),
      {} as { [key: string]: AllSchemas }
    ),
    ...headerParams.reduce(
      (acc, { subSchemas }) => ({
        ...acc,
        ...subSchemas,
      }),
      {} as { [key: string]: AllSchemas }
    ),
  };

  // Add the actual parameters to the url
  apiRoute.parameters = [
    ...queryParams.map(p => p.param),
    ...pathParams.map(p => p.param),
    ...headerParams.map(p => p.param),
  ];

  // Set the request body
  if (route.validator.body) {
    const bodySchema = generateJsonSchema(route.validator.body, SCHEMA_PATH);
    openApi.components.schemas = { ...openApi.components.schemas, ...bodySchema.named };

    apiRoute.requestBody = {
      content: {
        "application/json": {
          schema: bodySchema.root,
          examples: mocking && {
            "application/json": { value: mocking.mockAll(route.validator.body) },
          },
        },
      },
    };
  }

  apiRoute.responses = {};
  if (route.validator.response) {
    // If the type is a union we will look if the union does not have a status code. If this is the case the unions
    // will be split up, so every body of the union can have his own status code.
    // Only unions without a status code will be plugged apart
    if (
      route.validator.response instanceof LuftUnion &&
      route.validator.response.validationStorage.status?.code === undefined
    ) {
      // Get responses in the union with and without a status code
      const responsesWithStatusCode: LuftType[] = [];
      const responsesWithoutStatusCode: LuftType[] = [];

      for (const nestedType of route.validator.response.schema.types) {
        if (nestedType.validationStorage.status?.code !== undefined) {
          responsesWithStatusCode.push(nestedType);
        } else {
          responsesWithoutStatusCode.push(nestedType);
        }
      }

      // Clone the schema and add the responses without status code to the cloned union
      const unionClone = route.validator.response.clone();
      unionClone.schema.types = responsesWithoutStatusCode;
      // Let the default handler handle the union
      route.validator.response = unionClone;

      const officialStatusCode =
        route.validator.response?.validationStorage.status?.code ?? (route.method === "POST" ? 201 : 200);

      for (const [index, type] of responsesWithStatusCode.entries()) {
        // Add the responses with have the same status code as the default one to the union
        if (type.validationStorage.status!.code === officialStatusCode) {
          unionClone.schema.types.push(type);
          responsesWithoutStatusCode.slice(index, 1);
        }
      }

      for (const responsesWithStatusCodeElement of responsesWithStatusCode) {
        const responseSchema = generateJsonSchema(responsesWithStatusCodeElement, SCHEMA_PATH);
        openApi.components.schemas = { ...openApi.components.schemas, ...responseSchema.named };

        apiRoute.responses[
          responsesWithStatusCodeElement.validationStorage.status!.code.toString() as HttpStatusCodes
        ] = {
          description: route.validator.response?.validationStorage.description ?? "",
          content: {
            "application/json": {
              schema: responseSchema.root,
              examples: mocking && {
                "application/json": {
                  value: mocking.mockAll(route.validator.response),
                },
              },
            },
          },
        };
      }
    }

    const responseSchema = generateJsonSchema(route.validator.response, SCHEMA_PATH);
    openApi.components.schemas = { ...openApi.components.schemas, ...responseSchema.named };

    apiRoute.responses[
      route.validator.response?.validationStorage.status?.code ?? (route.method === "POST" ? 201 : 200)
    ] = {
      description: route.validator.response?.validationStorage.description ?? "",
      content: {
        "application/json": {
          schema: responseSchema.root,
          examples: mocking && {
            "application/json": {
              value: mocking.mockAll(route.validator.response),
            },
          },
        },
      },
    };
  }
  // Empty response
  else {
    apiRoute.responses["204"] = { description: "empty" };
  }

  mergeIn(apiRoute, route.info);
};

const getParameters = (
  validator: LuftObject<Record<string, LuftType>> | undefined,
  position: "path" | "header" | "query"
): { param: Parameter | Reference; subSchemas: { [name: string]: AllSchemas } }[] => {
  return Object.entries(validator?.schema?.type || {}).map(([name, value]) => {
    const subSchemas = generateJsonSchema(value, SCHEMA_PATH);

    return {
      param: {
        name: value.validationStorage.name ? value.validationStorage.name : name,
        schema: subSchemas.root,
        in: position,
        required: !value.validationStorage.default.isSet,
        deprecated: value.validationStorage.deprecated,
        description: value.validationStorage.description,
      },
      subSchemas: subSchemas.named,
    };
  });
};

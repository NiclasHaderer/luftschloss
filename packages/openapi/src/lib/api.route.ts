/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { DeepPartial, getTypeOf, normalizePath, Promisable, uniqueList, withDefaults } from "@luftschloss/common";
import { Operation } from "@luftschloss/openapi-schema";
import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/server";
import {
  LuftArray,
  LuftInfer,
  LuftObject,
  LuftRecord,
  LuftString,
  LuftTuple,
  LuftType,
  LuftUnion,
  ValidationHook,
} from "@luftschloss/validation";
import { ApiRouter } from "./api.router";

export type OpenApiHandler<
  PATH extends LuftObject<any> | undefined,
  URL_PARAMS extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | LuftArray<any> | LuftRecord<any, any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftType | undefined
> = (args: {
  path: PATH extends LuftType ? LuftInfer<PATH> : undefined;
  query: URL_PARAMS extends LuftType ? LuftInfer<URL_PARAMS> : undefined;
  body: BODY extends LuftType<infer T> ? T : undefined;
  headers: HEADERS extends LuftType ? LuftInfer<HEADERS> : undefined;
  request: LRequest;
  response: LResponse;
}) => Promisable<RESPONSE extends LuftType<infer T> ? T : undefined>;

export interface RouterParams<
  PATH extends LuftObject<any> | undefined,
  URL_PARAMS extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | LuftArray<any> | LuftRecord<any, any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftType | undefined
> {
  path: PATH;
  query: URL_PARAMS;
  body: BODY;
  headers: HEADERS;
  response: RESPONSE;
}

export type CollectedRoute<
  PATH extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  QUERY extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  BODY extends
    | LuftObject<Record<string, LuftType>>
    | LuftArray<LuftType>
    | LuftRecord<LuftString, LuftType>
    | undefined =
    | LuftObject<Record<string, LuftType>>
    | LuftArray<LuftType>
    | LuftRecord<LuftString, LuftType>
    | undefined,
  HEADERS extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  RESPONSE extends LuftType | undefined = LuftType | undefined
> = {
  path: `/${string}`;
  method: HTTP_METHODS;
  validator: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  info: DeepPartial<Operation>;
};

export class ApiRoute<
  PATH extends LuftObject<any> | undefined,
  QUERY extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | LuftArray<any> | LuftRecord<any, any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftType | undefined
> {
  private infoObject?: DeepPartial<Operation>;

  public constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    private tags: string[],
    private validators: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ) {
    this.validators.query = extractSingleElementFromList(this.validators.query);
    this.validators.headers = extractSingleElementFromList(this.validators.headers);
  }

  protected clone(): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    const copied = new ApiRoute(this.router, this.collector, this.tags, this.validators);
    copied.infoObject = this.infoObject || {};
    return copied;
  }

  public modify<
    NEW_PATH extends LuftObject<any> | undefined = PATH,
    NEW_QUERY extends LuftObject<any> | undefined = QUERY,
    NEW_BODY extends LuftObject<any> | LuftArray<any> | LuftRecord<any, any> | undefined = BODY,
    NEW_HEADERS extends LuftObject<any> | undefined = HEADERS,
    NEW_RESPONSE extends LuftType | undefined = RESPONSE
  >(
    params: Partial<RouterParams<NEW_PATH, NEW_QUERY, NEW_BODY, NEW_HEADERS, NEW_RESPONSE>>
  ): ApiRoute<NEW_PATH, NEW_QUERY, NEW_BODY, NEW_HEADERS, NEW_RESPONSE> {
    const clone = this.clone() as unknown as ApiRoute<NEW_PATH, NEW_QUERY, NEW_BODY, NEW_HEADERS, NEW_RESPONSE>;
    clone.validators = { ...clone.validators, ...params };
    clone.validators.query = extractSingleElementFromList(clone.validators.query);
    clone.validators.headers = extractSingleElementFromList(clone.validators.headers);
    return clone;
  }

  public info(info: DeepPartial<Operation>, mergeIntoCurrent = true): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    const clone = this.clone();
    clone.infoObject = mergeIntoCurrent ? withDefaults<Operation>(this.infoObject || {}, info) : info;
    return clone;
  }

  public handle<T extends HTTP_METHODS | HTTP_METHODS[] | "*">(
    method: T,
    path: string,
    callHandler: T extends "*"
      ? OpenApiHandler<PATH, QUERY, BODY | undefined, HEADERS, RESPONSE>
      : T extends "GET" | "HEAD"
      ? OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
      : T[number] extends "GET" | "HEAD"
      ? OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
      : "GET" extends T[number]
      ? OpenApiHandler<PATH, QUERY, undefined | BODY, HEADERS, RESPONSE>
      : "HEAD" extends T[number]
      ? OpenApiHandler<PATH, QUERY, undefined | BODY, HEADERS, RESPONSE>
      : OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    const methods: HTTP_METHODS[] = Array.isArray(method)
      ? method
      : method === "*"
      ? Object.values(HTTP_METHODS)
      : [method];
    for (const method of methods) {
      this.collector.add(
        path,
        method,
        this.wrapWithOpenApi(callHandler as OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>)
      );
      const info = this.infoObject ?? {};
      info.tags = uniqueList([...(info.tags || []), ...this.tags]);

      this.router.apiRoutes.push({
        path: normalizePath(path),
        info: info,
        method: method,
        validator: this.validators,
      });
    }
    return this;
  }

  public get(
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public get(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public get(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("GET", urlOrHandler, callHandler!);
    }
    return this.handle("GET", "", urlOrHandler);
  }

  public head(
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public head(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public head(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("HEAD", urlOrHandler, callHandler!);
    }
    return this.handle("HEAD", "", urlOrHandler);
  }

  public post(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public post(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public post(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("POST", urlOrHandler, callHandler!);
    }
    return this.handle("POST", "", urlOrHandler);
  }

  public put(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public put(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public put(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("PUT", urlOrHandler, callHandler!);
    }
    return this.handle("PUT", "", urlOrHandler);
  }

  public delete(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public delete(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public delete(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("DELETE", urlOrHandler, callHandler!);
    }
    return this.handle("DELETE", "", urlOrHandler);
  }

  public options(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public options(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public options(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("OPTIONS", urlOrHandler, callHandler!);
    }
    return this.handle("OPTIONS", "", urlOrHandler);
  }

  public trace(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public trace(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public trace(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("TRACE", urlOrHandler, callHandler!);
    }
    return this.handle("TRACE", "", urlOrHandler);
  }

  public patch(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public patch(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public patch(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("PATCH", urlOrHandler, callHandler!);
    }
    return this.handle("PATCH", "", urlOrHandler);
  }

  public all(
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public all(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>;
  public all(
    urlOrHandler: string | OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    callHandler?: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (typeof urlOrHandler === "string") {
      return this.handle("*", urlOrHandler, callHandler!);
    }
    return this.handle("*", "", urlOrHandler);
  }

  private wrapWithOpenApi(handler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      // Set the response status code here, so it can be overwritten in the handler
      // Include the custom true to be able to see if the status gets overwritten<
      const defaultReturnCode = request.method === "POST" ? Status.HTTP_201_CREATED : Status.HTTP_200_OK;
      response.status(defaultReturnCode);

      // Path
      const parsedPath = await parseAndError(this.validators.path, () => request.pathParams(), "path");

      // Query
      const parsedQuery = await parseAndError(this.validators.query, () => request.url.searchParams.encode(), "query");

      // Body
      const ignoreBody = request.method === "GET" || request.method === "HEAD";
      const parsedBody = await parseAndError(
        ignoreBody ? (undefined as BODY) : this.validators.body,
        () => request.json(),
        "body"
      );

      // Headers
      const parsedHeaders = await parseAndError(this.validators.headers, () => request.headers.encode(), "headers");

      // Response
      const responseBody = await handler({
        path: parsedPath,
        body: parsedBody,
        query: parsedQuery,
        headers: parsedHeaders,
        request,
        response,
      });

      let parsedResponseBody: string | number | boolean | null | undefined | object | unknown[];
      if (this.validators.response === undefined) {
        parsedResponseBody = undefined;
      } else {
        const parsedData = this.validators.response.coerceSave(responseBody);
        if (!parsedData.success) {
          throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, {
            issues: parsedData.issues,
            location: "response",
          });
        } else {
          parsedResponseBody = parsedData.data;

          // Try to get the status from the used validator and if the used validator does not have a status code
          // use the one of the passed validator.
          // Checking the usedValidator has to be done because only by using this technique we can get the status
          // that was actually used to validate the data successfully (for example in case of a union first the matching
          // validator of the union will be checked for a status code and afterwards if this validator does not have a
          // status code look at the status code of the union).
          const responseStatus =
            parsedData.usedValidator.validationStorage.status ?? this.validators.response.validationStorage.status;
          if (responseStatus !== undefined) {
            response.status(responseStatus);
          }
        }
      }

      if (typeof parsedResponseBody === "object" || typeof parsedResponseBody === "boolean") {
        response.json(parsedResponseBody);
      } else if (typeof parsedResponseBody === "string") {
        response.text(parsedResponseBody);
      } else if (parsedResponseBody === undefined || parsedResponseBody === null) {
        response.text("");
      } else if (typeof parsedResponseBody === "number") {
        response.text(parsedResponseBody.toString());
      } else {
        throw new HTTPException(
          Status.HTTP_500_INTERNAL_SERVER_ERROR,
          `Cannot serialize type ${getTypeOf(parsedResponseBody)}`
        );
      }
    };
  }
}

const parseAndError = async <T extends LuftType | undefined>(
  validator: T,
  getData: () => unknown | Promise<unknown>,
  location: "query" | "headers" | "path" | "body" | "response",
  statusCode: Status = Status.HTTP_400_BAD_REQUEST
): Promise<T extends LuftType<infer TYPE> ? TYPE : undefined> => {
  if (validator === undefined) return undefined as T extends LuftType<infer TYPE> ? TYPE : undefined;
  const data = await getData();
  const parsedData = validator.coerceSave(data);
  if (!parsedData.success) {
    throw new HTTPException(statusCode, { issues: parsedData.issues, location: location });
  }
  return parsedData.data;
};

const extractArrayElement: ValidationHook<unknown, unknown, unknown> = (value: unknown) => {
  if (Array.isArray(value) && value.length === 1) return { action: "continue", data: value[0] };
  return { action: "continue", data: value };
};

const extractSingleElementFromList = <T extends LuftObject<Record<string, LuftType>> | undefined>(validator: T): T => {
  if (validator === undefined) return undefined as T;

  const applyExtract = (validators: LuftType[]) => {
    for (const v of validators) {
      if (v instanceof LuftUnion) {
        applyExtract(v.schema.types);
      } else if (!(v instanceof LuftArray) && !(v instanceof LuftTuple)) {
        v.beforeHook(extractArrayElement as any, false);
      }
    }
  };

  const copy = validator.clone();
  applyExtract(Object.values(copy.schema.type));
  return copy as T;
};

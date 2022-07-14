/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { saveObject } from "@luftschloss/core"
import { IncomingMessage as In, ServerResponse as Out } from "http"

import { Middleware, ReadonlyMiddlewares } from "../middleware"
import { HTTPException } from "./http-exception"
import { LRequest } from "./request"
import { RequestImpl } from "./request-impl"
import { resolveRoute } from "./resolve-route"
import { LResponse } from "./response"
import { ResponseImpl } from "./response-impl"
import { HTTP_METHODS, LookupResultStatus, ROUTE_HANDLER, RouteLookupResult } from "./route-collector.model"
import { MergedRoutes } from "./router-merger"
import { Status } from "./status"

export class RequestPipeline {
  private locked = false
  private routes!: Readonly<MergedRoutes>

  public constructor(private mandatoryMiddleware: ReadonlyMiddlewares) {}

  public async queue(req: In, res: Out): Promise<void> {
    if (!this.locked) throw new Error("RequestPipeline has not been locked. You have to lock it in order to use it")
    // Wrap the node request/response in own implementation
    const request = new RequestImpl(req)
    const response = new ResponseImpl(res, request)

    // Get the request handler for a certain url
    const route = resolveRoute(request.path, request.method, this.routes)

    // Set the extracted path params in the request instance
    request.setPathParams(route.pathParams || saveObject<Record<string, unknown>>())

    // Get a successful result and if an executor could not be resolved wrap it in a default not found executor or
    // method not allowed executor
    const requestExecutor = this.retrieveExecutor(route, request.method)

    // Create chain which will run the middleware and the callback
    const executionChain = buildMiddlewareExecutionChain(requestExecutor)
    await executionChain.run(request, response)
  }

  public lock(entries: MergedRoutes): void {
    if (this.locked) throw new Error("Cannot lock the request pipeline a second time")
    this.locked = true
    this.routes = entries
  }

  /**
   * Unwrap the routeLookup and handle the case that a handler was not found, or the wrong method was used
   *
   * @param routeLookup The result of the route lookup. Can be successful or not
   * @param method The method that should be executed
   * @returns The executor that will handle the route at the end and the pipeline the request has to pass before being
   * passed to the executor
   */
  private retrieveExecutor(
    routeLookup: RouteLookupResult,
    method: HTTP_METHODS
  ): { executor: ROUTE_HANDLER; pipeline: Iterable<Middleware> } {
    // Send default options response
    if (method === "OPTIONS" && routeLookup.status !== LookupResultStatus.OK) {
      return {
        executor: (request, response) => {
          response.status(Status.HTTP_204_NO_CONTENT).header("Allow", routeLookup.availableMethods.join(", "))
        },
        pipeline: this.mandatoryMiddleware,
      }
    }

    switch (routeLookup.status) {
      case LookupResultStatus.METHOD_NOT_ALLOWED: {
        return {
          executor: () => {
            throw new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED)
          },
          pipeline: this.mandatoryMiddleware,
        }
      }
      case LookupResultStatus.NOT_FOUND: {
        return {
          executor: () => {
            throw new HTTPException(Status.HTTP_404_NOT_FOUND)
          },
          pipeline: this.mandatoryMiddleware,
        }
      }
      case LookupResultStatus.OK:
        return routeLookup
    }
  }
}

const buildMiddlewareExecutionChain = (route: { executor: ROUTE_HANDLER; pipeline: Iterable<Middleware> }) => {
  // TODO next() called multiple times
  const pipeline = [...route.pipeline]
  return {
    run: async (req: LRequest, res: LResponse): Promise<void> => {
      let index = -1
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const executionWrapper = async (request: LRequest, response: LResponse): Promise<any> => {
        index += 1
        if (index >= pipeline.length) {
          return route.executor(request, response)
        }
        await pipeline[index].handle(executionWrapper, req, res)
      }
      await executionWrapper(req, res)
    },
  }
}

import { NextFunction } from "./middleware"
import { defaultErrorHandler, HTTPException, Request, Response, ResponseImpl, Status } from "../core"

const RequestCompleterMiddleware = async (next: NextFunction, request: Request, response: Response): Promise<void> => {
  await next(request, response)

  if (response instanceof ResponseImpl) {
    try {
      // Some error happened in the end method. Perhaps a stream corrupted, etc...
      await response.end()
    } catch (e) {
      try {
        // Try to complete with the default internal server error handler
        await defaultErrorHandler.HTTP_500_INTERNAL_SERVER_ERROR(
          HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR),
          request,
          response
        )
        await response.end()
      } catch (e) {
        console.error(e)
        // If this did not work, just send the internal error response
        await response.text("Internal error").end()
      }
    }
  } else {
    console.warn(
      "It looks like you do not use the default implementation of the Response object. Please remove the RequestCompleterMiddleware if this is the case"
    )
  }
}

export const requestCompleter = (): typeof RequestCompleterMiddleware => RequestCompleterMiddleware

import { fromCode, Status } from "./status"
import { ValueOf } from "../types"

/**
 * Every custom error has to extend the HTTPException. Otherwise, the error will be treated like an 500
 */
export class HTTPException extends Error {
  public readonly status: ValueOf<typeof Status>

  /**
   * @param status An HttpStatus, or the number of a http status.
   * @param message If the message is empty the default message of the http status will be used
   */
  constructor(status: ValueOf<typeof Status> | number, message?: string) {
    super()

    // Get the status code value for a number
    const tmp = typeof status === "number" ? fromCode(status) : status

    if (!tmp) {
      // Invalid status code
      message = `Invalid status code ${status}`
      status = Status.HTTP_500_INTERNAL_SERVER_ERROR
    } else {
      status = tmp
    }

    this.status = status
    this.message = message || status.message
  }

  /**
   * Wrap every js error object in a HTTPException
   */
  public static wrap(error: Error, status: ValueOf<typeof Status> | number): HTTPException {
    const e = new HTTPException(status, error.message)
    e.stack = error.stack
    return e
  }
}

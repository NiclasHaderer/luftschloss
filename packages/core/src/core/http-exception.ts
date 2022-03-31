import { Status, toStatus } from "./status"

/**
 * Every custom error has to extend the HTTPException. Otherwise, the error will be treated like an 500
 */
export class HTTPException extends Error {
  public readonly status: Status

  /**
   * @param status An HttpStatus, or the number of a http status.
   * @param message If the message is empty the default message of the http status will be used
   */
  constructor(status: Status | number, message?: string) {
    super()

    // Get the status code value for a number
    this.status = toStatus(status)
    this.message = message || this.status.message
  }

  /**
   * Wrap every js error object in a HTTPException
   */
  public static wrap(error: Error, status: Status | number): HTTPException {
    const e = new HTTPException(status, error.message)
    e.stack = error.stack
    return e
  }
}

import { fromCode, Status } from "./status"
import { ValueOf } from "../types"

export class HTTPException extends Error {
  public readonly status: ValueOf<typeof Status>

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

  public static wrap(error: Error, status: ValueOf<typeof Status>): HTTPException {
    const e = new HTTPException(status, error.message)
    e.stack = error.stack
    return e
  }
}

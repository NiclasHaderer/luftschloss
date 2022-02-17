import { fromCode, Status } from "./status"
import { ValueOf } from "../types"

export class HTTPException extends Error {
  public readonly status: ValueOf<typeof Status>

  constructor(status: ValueOf<typeof Status> | number, public override readonly message: string) {
    super(message)
    // Get the status code value for a number
    const tmp = typeof status === "number" ? fromCode(status) : status

    if (!tmp) {
      // Invalid status code
      this.message = `Invalid status code ${status}`
      this.status = Status.HTTP_500_INTERNAL_SERVER_ERROR
    } else {
      this.status = tmp
    }
  }

  public static wrap(error: Error, status: ValueOf<typeof Status>): HTTPException {
    const e = new HTTPException(status, error.message)
    e.stack = error.stack
    return e
  }
}

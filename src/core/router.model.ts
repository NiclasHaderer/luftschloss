import { MiddlewareRepresentation } from "../middleware/middleware"
import { ReadonlyRoutingController } from "./routing-controller.model"

export interface Router {
  readonly middleware: Iterable<MiddlewareRepresentation>
  readonly routes: ReadonlyRoutingController
}

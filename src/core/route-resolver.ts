import { RouteLookupResult } from "./route-collector.model"
import { MergedRoute } from "./router-merger"
import { PathValidators } from "../path-validator/validator"

class RouteResolver implements Iterable<{ matches: (path: string) => RouteLookupResult }> {
  constructor(private routes: MergedRoute[], pathValidator: PathValidators) {}

  public [Symbol.iterator](): Iterator<{ matches: (path: string) => RouteLookupResult }> {
    // TODO
    return undefined
  }
}

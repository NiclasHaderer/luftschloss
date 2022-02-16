import { Router } from "./router"
import { Observable } from "rxjs"

export type EventData = {
  data: Record<string, any>
}

export interface ServerEvents {
  readonly handleEnd$: Observable<EventData>
  readonly handleStart$: Observable<EventData>
  readonly shutdown$: Observable<void>
  readonly start$: Observable<void>
}

export interface Server extends ServerEvents, Router {
  listen(port?: number): void
}

import { IncomingMessage, ServerResponse } from "http"
import { DispatchFunc, inject, InjectOptions } from "light-my-request"

interface TestingServer {
  handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void
}

export const testClient = (server: TestingServer, options?: InjectOptions | string) => {
  return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, options)
}

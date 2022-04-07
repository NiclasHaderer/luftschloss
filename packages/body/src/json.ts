import { HTTPException, HttpMiddlewareInterceptor, NextFunction, Request, Response, Status } from "@luftschloss/core"
import { withDefaults } from "@luftschloss/core/dist/core/with-defaults"
import { getBodyContentType, getBodyData, verifyContentLengthHeader } from "./common"
import * as Buffer from "buffer"

export type JsonParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export type InternalJsonParserOptions = { contentType: Set<string> } & JsonParserOptions

async function JsonParserMiddleware(
  this: InternalJsonParserOptions,
  next: NextFunction,
  request: Request,
  response: Response
) {
  verifyContentLengthHeader(request, this.maxBodySize)

  let parsed: object | null = null
  request.body = async <T>(): Promise<T> => {
    const contentType = getBodyContentType(request)
    if (!contentType) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has not content type header")
    }

    if (!this.contentType.has(contentType.type)) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has wrong content type header")
    }

    if (parsed === null) {
      const buffer = await getBodyData(request, this.maxBodySize)
      parsed = this.parser(buffer, contentType.encoding)
    }

    return parsed as unknown as T
  }

  await next(request, response)
}

export const jsonParser = (
  contentType = ["application/json"],
  options: Partial<JsonParserOptions>
): HttpMiddlewareInterceptor => {
  const completeOptions = withDefaults<JsonParserOptions>(options, {
    maxBodySize: 100,
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => JSON.parse(buffer.toString(encoding)) as object,
  })
  return JsonParserMiddleware.bind({
    parser: completeOptions.parser,
    maxBodySize: completeOptions.maxBodySize * 100,
    contentType: new Set(contentType.map(c => c.toLowerCase().trim())),
  })
}

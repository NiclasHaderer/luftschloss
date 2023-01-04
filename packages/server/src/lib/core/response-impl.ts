/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { ReadStream } from "fs";
import { ServerResponse } from "http";
import { DefaultErrorHandler } from "./error-handler";

import { Headers } from "./headers";
import { HTTPException } from "./http-exception";
import type { LRequest } from "./request";

import type { LResponse } from "./response";
import { Status, toStatus } from "./status";
import { UTF8SearchParams } from "./utf8-search-params";
import { URLSearchParams } from "url";

const NOT_COMPLETED = Symbol("NOT_COMPLETED");

export class ResponseImpl implements LResponse {
  private _status: Status = Status.HTTP_200_OK;
  private _headers = new Headers();

  private data: ReadStream | ReadStream[] | Buffer | typeof NOT_COMPLETED | string = NOT_COMPLETED;

  public constructor(private readonly res: ServerResponse, public readonly request: LRequest) {}

  public get raw(): ServerResponse {
    return this.res;
  }

  public get complete(): boolean {
    return this.res.writableEnded;
  }

  public get headers(): Headers {
    return this._headers;
  }

  public buffer(bytes: Buffer): this {
    this.data = bytes;
    return this;
  }

  public form(
    data:
      | UTF8SearchParams
      | URLSearchParams
      | string
      | Record<string, string | ReadonlyArray<string>>
      | Iterable<[string, string]>
      | ReadonlyArray<[string, string]>
  ): this {
    this.headers.append("Content-Type", "application/x-www-form-urlencoded");
    if (data instanceof UTF8SearchParams || data instanceof URLSearchParams) {
      this.data = data.toString();
    } else {
      this.data = new UTF8SearchParams(data).toString();
    }
    return this;
  }

  public header(name: string, value: string | number | Iterable<string | number>): this {
    if (typeof value === "number" || typeof value === "string") {
      this._headers.append(name, value);
    } else {
      this._headers.appendAll(name, value);
    }
    return this;
  }

  public html(text: string): this {
    this.headers.append("Content-Type", "text/html");
    this.data = text;
    return this;
  }

  public empty(): this {
    this.data = "";
    this.status(Status.HTTP_204_NO_CONTENT);
    return this;
  }

  public json(object: object | string | null | boolean): this {
    this.headers.append("Content-Type", "application/json");
    if (typeof object === "string") {
      this.data = object;
    } else {
      this.data = JSON.stringify(object);
    }
    return this;
  }

  public redirect(
    url: string | URL,
    type?: "301_MOVED_PERMANENTLY" | "302_FOUND" | "307_TEMPORARY_REDIRECT" | "308_PERMANENT_REDIRECT"
  ): this {
    type = type ?? ("307_TEMPORARY_REDIRECT" as const);
    const finalType = `HTTP_${type}` as const;
    this.status(Status[finalType]);
    this.headers.append("Location", url.toString());
    if (this.data === NOT_COMPLETED) {
      this.data = "";
    }
    return this;
  }

  public getStatus(): Status {
    return this._status;
  }

  public status(status: Status | number): this {
    this._status = toStatus(status);
    return this;
  }

  public stream(stream: ReadStream | ReadStream[]): this {
    this.data = stream;
    return this;
  }

  public text(text: string): this {
    this.headers.append("Content-Type", "text/plain");
    this.data = text;
    return this;
  }

  /**
   * @internal
   */
  public async end(): Promise<void> {
    try {
      // Some error happened in the end method. Perhaps a stream corrupted, etc...
      await this._end();
    } catch (e) {
      try {
        // Try to complete with the default internal server error handler
        await DefaultErrorHandler.HTTP_500_INTERNAL_SERVER_ERROR(
          HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR),
          this.request,
          this
        );
        await this._end();
      } catch (e) {
        console.error("Error in request completer", e);
        // If this did not work, just send the internal error response
        await this.text("Internal error")._end();
      }
    }
  }

  private async _end() {
    // Write headers and status code
    this.res.writeHead(this._status.code, this.headers.encode());

    // Write the body of the response
    if (this.data instanceof ReadStream || Array.isArray(this.data)) {
      await this.streamResponse(this.data);
      this.res.end();
    } else if (this.data === NOT_COMPLETED) {
      // Pass to the error handler and the error handler will call end with the right data
      throw new HTTPException(
        Status.HTTP_500_INTERNAL_SERVER_ERROR,
        "Server did not not send a response. Did you or one of your middlewares/routes forget to await an async call?"
      );
    } else if (this.data instanceof Buffer) {
      // Null cannot be written to stdout and ?? checks for undefined and null
      await new Promise(resolve => this.res.write(this.data, resolve));
      this.res.end();
    } else {
      // Just in case an undefined or null slipped through
      this.res.end(this.data ?? "");
    }
  }

  private async streamResponse(stream: ReadStream | ReadStream[]): Promise<void> {
    if (stream instanceof ReadStream) {
      return new Promise<void>((resolve, reject) => {
        // TODO check if stream open event is needed
        // TODO destroy stream on error?
        stream.pipe(this.res);
        stream.on("close", resolve);
        stream.on("error", reject);
      });
    }
    for (const readStream of stream) {
      await this.streamResponse(readStream);
    }
  }
}

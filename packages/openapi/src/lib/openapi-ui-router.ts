/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LRequest, LResponse, RouterBase } from "@luftschloss/server"

export abstract class OpenApiUiRouter extends RouterBase {
  protected abstract handleDocs(_: LRequest, response: LResponse): Promise<void>

  public constructor(protected docsUrl: string, protected openApiUrl: string) {
    super()
    this.routeCollector.add(this.docsUrl, "GET", this.handleDocs.bind(this))
  }
}

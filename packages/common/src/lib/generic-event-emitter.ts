/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ValueOf } from "./types"

interface EventSubscription {
  unsubscribe(): void
}

type EventCallback<DATA> = (data: DATA) => any

export class GenericEventEmitter<T extends Record<string, unknown>> {
  private onEventMap = new Map<keyof T, Set<EventCallback<any>>>()
  private onCompleteEventMap = new Map<keyof T, Set<EventCallback<any>>>()
  private lastEventData = new Map<keyof T, any>()

  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    getLastValue: true,
    callback: EventCallback<DATA>
  ): EventSubscription
  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    callback: EventCallback<DATA>
  ): EventSubscription
  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    callbackOrGetLast: EventCallback<DATA> | true,
    callback?: EventCallback<DATA>
  ): EventSubscription {
    if (!this.onEventMap.has(event)) {
      this.onEventMap.set(event, new Set<EventCallback<ValueOf<T>>>())
    }
    const eventHandlers = this.onEventMap.get(event)!

    if (typeof callbackOrGetLast === "boolean") {
      eventHandlers.add(callback!)
      if (this.lastEventData.has(event)) {
        callback!(this.lastEventData.get(event) as DATA)
      }
    } else {
      eventHandlers.add(callbackOrGetLast)
    }

    return {
      unsubscribe() {
        eventHandlers.delete(typeof callbackOrGetLast === "boolean" ? callback! : callbackOrGetLast)
      },
    }
  }

  public onComplete<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT): Promise<DATA> {
    return new Promise<DATA>(resolve => {
      if (!this.onCompleteEventMap.has(event)) {
        this.onCompleteEventMap.set(event, new Set<EventCallback<ValueOf<T>>>())
      }
      const eventHandlers = this.onEventMap.get(event)!
      eventHandlers.add((data: DATA) => resolve(data))
    })
  }

  public emit<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT, data: DATA): void {
    this.lastEventData.set(event, data)

    const handlers = this.onEventMap.get(event)
    if (!handlers) return

    for (const handler of handlers) {
      handler(data)
    }
  }

  public complete<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT, data: DATA): void {
    this.lastEventData.set(event, data)

    const handlers = this.onEventMap.get(event) || []
    for (const handler of handlers) {
      handler(data)
    }

    const completeHandlers = this.onCompleteEventMap.get(event) || []
    for (const handler of completeHandlers) {
      handler(data)
    }
    this.onEventMap.delete(event)
    this.onCompleteEventMap.delete(event)
    this.lastEventData.delete(event)
  }
}

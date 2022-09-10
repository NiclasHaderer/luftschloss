/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ValueOf } from "./types"

interface EventSubscription {
  unsubscribe(): void
}

type EventCallback<DATA> = (data: DATA) => any | Promise<any>

export class GenericEventEmitter<T extends Record<string, unknown>> {
  private onEventMap = new Map<keyof T, Set<EventCallback<any>>>()
  private onCompleteEventMap = new Map<keyof T, Set<EventCallback<any>>>()
  private lastEventData = new Map<keyof T, any>()

  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    getLastValue: boolean,
    callback: EventCallback<DATA>
  ): EventSubscription
  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    callback: EventCallback<DATA>
  ): EventSubscription
  public on<EVENT extends keyof T, DATA extends T[EVENT]>(
    event: EVENT,
    callbackOrGetLast: EventCallback<DATA> | boolean,
    callback?: EventCallback<DATA>
  ): EventSubscription {
    if (!this.onEventMap.has(event)) {
      this.onEventMap.set(event, new Set<EventCallback<ValueOf<T>>>())
    }
    const eventHandlers = this.onEventMap.get(event)!

    if (typeof callbackOrGetLast === "boolean") {
      eventHandlers.add(callback!)
      if (this.lastEventData.has(event) && callbackOrGetLast === true) {
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

  public getLastData<EVENT extends keyof T>(event: EVENT): T[EVENT] | undefined {
    return this.lastEventData.get(event)
  }

  public onComplete<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT): Promise<DATA> {
    return new Promise<DATA>(resolve => {
      if (!this.onCompleteEventMap.has(event)) {
        this.onCompleteEventMap.set(event, new Set<EventCallback<ValueOf<T>>>())
      }
      const eventHandlers = this.onCompleteEventMap.get(event)!
      eventHandlers.add((data: DATA) => resolve(data))
    })
  }

  public emit<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT, data: DATA): void {
    void this.emitSync(event, data)
  }

  public async emitSync<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT, data: DATA): Promise<void> {
    this.lastEventData.set(event, data)

    const handlers = this.onEventMap.get(event) || []

    await Promise.all([...handlers].map(h => h(data)))
  }

  public async complete<EVENT extends keyof T, DATA extends T[EVENT]>(event: EVENT, data: DATA): Promise<void> {
    this.lastEventData.set(event, data)

    const handlers = this.onEventMap.get(event) || []
    await Promise.all([...handlers].map(h => h(data)))

    const completeHandlers = this.onCompleteEventMap.get(event) || []
    await Promise.all([...completeHandlers].map(h => h(data)))

    this.onEventMap.delete(event)
    this.onCompleteEventMap.delete(event)
    this.lastEventData.delete(event)
  }
}

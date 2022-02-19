type EventCallback<T> = (data: T) => void | Promise<void>

export interface Subscription {
  unsubscribe(): void
}

export interface Observable<T> {
  subscribe(callback: EventCallback<T>): Subscription
}

export class Subject<T> implements Observable<T> {
  protected _value: T | null = null
  private _complete = false
  private callbacks: EventCallback<T>[] = []
  private resolveCallbacks: ((data: T | null) => void)[] = []

  public asObservable(): Observable<T> {
    return this
  }

  public complete(): void {
    this._complete = true
    this.resolveCallbacks.forEach(resolve => resolve(this._value))
    this.callbacks = []
    this.resolveCallbacks = []
  }

  public next(data: T): void {
    this.nextAsync(data).then()
  }

  public nextAsync(data: T): Promise<void> {
    if (this._complete) return Promise.resolve()
    this._value = data
    return Promise.all(this.callbacks.map(c => c(data))).then()
  }

  public subscribe(callback: EventCallback<T>): Subscription {
    this.callbacks.push(callback)
    return {
      unsubscribe: (): void => {
        const index = this.callbacks.findIndex(c => c === callback)
        if (index === -1) return
        this.callbacks.splice(index, 1)
      },
    }
  }

  public toPromise(): Promise<T | null> {
    return new Promise<T | null>(resolve => {
      this.resolveCallbacks.push(resolve)
    })
  }
}

export class BehaviourSubject<T> extends Subject<T> {
  protected override _value: T

  constructor(initialValue: T) {
    super()
    this._value = initialValue
  }

  public get value(): T {
    return this._value
  }

  public override subscribe(callback: EventCallback<T>): Subscription {
    callback(this._value)
    return super.subscribe(callback)
  }

  public override toPromise(): Promise<T> {
    return super.toPromise() as Promise<T>
  }
}

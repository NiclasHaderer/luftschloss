/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export type ValueOf<T> = T[keyof T]

export type Constructor<CLAZZ, ARGS extends []> = new (...args: ARGS) => CLAZZ

export type Func = (...args: any) => any

export type CustomPropertyDescriptor<THIS extends object, KEY extends PropertyKey> =
  | {
      configurable?: boolean
      enumerable?: boolean
      value?: KEY extends keyof THIS
        ? THIS[KEY] extends Func
          ? (this: THIS, ...args: Parameters<THIS[KEY]>) => ReturnType<THIS[KEY]>
          : THIS[KEY]
        : any
      writable?: boolean
    }
  | {
      configurable?: boolean
      enumerable?: boolean
      writable?: boolean

      get(): KEY extends keyof THIS ? THIS[KEY] : any
      set(v: KEY extends keyof THIS ? THIS[KEY] : any): void
    }

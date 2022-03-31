export type ValueOf<T> = T[keyof T]

export type Constructor<CLAZZ, ARGS extends []> = new (...args: ARGS) => CLAZZ

const isObject = (value: unknown): value is Record<string, any> => value instanceof Object

export const deepCopy = <T>(object: T): T => {
  if (!isObject(object)) return object

  const newObject = {} as T
  for (const key of Object.keys(object)) {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ;(newObject as Record<string, any>)[key] = deepCopy((object as Record<string, any>)[key])
  }
  return newObject
}

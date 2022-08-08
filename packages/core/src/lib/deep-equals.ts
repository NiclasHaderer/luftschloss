/* eslint-disable @typescript-eslint/no-explicit-any */

class Stack {
  private readonly list: any[]

  constructor(...items: any[]) {
    this.list = items
  }

  public get notEmpty(): boolean {
    return this.list.length > 0
  }

  public push(o: any): void {
    this.list.push(o)
  }

  public pop(): any {
    return this.list.pop()
  }
}

const shallowEquals = (a: any, b: any) => a === b
const containsPrimitives = (...objects: any[]) => objects.some(o => !(o instanceof Object))

const comparator = (a: any, b: any): boolean | null => {
  // First check if the objects are shallow equal. If this is true we can skip the whole other part
  if (shallowEquals(a, b)) return true

  // Check if one of them is a primitive and if yes we can assume that they are not equal, because the previous check
  // was false
  if (containsPrimitives(a, b)) return false
  return null
}

export const deepEquals = (a: any, b: any): boolean => {
  const topEqual = comparator(a, b)
  if (typeof topEqual === "boolean") return topEqual

  // Create iterators which will iterate over the objects and the children of the objects
  const objectAIterator = new Stack(a)
  const objectBIterator = new Stack(b)

  while (objectAIterator.notEmpty) {
    // Get the objects themselves
    const objectA = objectAIterator.pop()
    const objectB = objectBIterator.pop()

    // Get the keys of the objects
    const keysA = Object.keys(objectA)
    const keysB = Object.keys(objectB)

    // Objects don't have the same amount of keys
    if (keysA.length !== keysB.length) return false

    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < keysA.length; ++index) {
      const keyA = keysA[index]
      // One of the keys are not the same
      if (!(keyA in objectB)) return false

      // Save the values of the keys
      const objectAValue = objectA[keyA]
      const objectBValue = objectB[keyA]

      // Compare the values
      const areEqual = comparator(objectAValue, objectBValue)

      // One of the values are not the same
      if (areEqual === false) return false
      // Values cannot be compared, because the keys are objects themselves.
      // Therefore, add them to the iterators and compare them again
      if (areEqual === null) {
        objectAIterator.push(objectAValue)
        objectBIterator.push(objectBValue)
      }
    }
  }
  return true
}

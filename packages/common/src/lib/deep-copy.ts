/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Func } from "./types";
import { saveObject } from "./utils";

const isObject = (value: unknown): value is Record<string, unknown> => value instanceof Object;
const isFunction = (value: unknown): value is Func => typeof value === "function";
export const deepCopy = <T>(object: T): T => {
  if (isFunction(object)) return object;
  if (!isObject(object)) return object;

  let newObject: T;
  if (Array.isArray(object)) {
    newObject = new Array(object.length) as unknown as T;
  } else {
    newObject = saveObject() as T;
  }

  for (const key of Object.keys(object)) {
    (newObject as Record<string, unknown>)[key] = deepCopy((object as Record<string, unknown>)[key]);
  }
  return newObject;
};

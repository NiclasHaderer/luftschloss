/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

let production: boolean | undefined;

export const isProduction = (): boolean => {
  production ??= process.env.production?.toLowerCase() === "true";
  return production;
};

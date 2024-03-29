/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/common";
import * as db from "mime-db";
import { extname } from "path";

type Extension = string;
type MimeType = string;
type ExtensionMimeMap = Record<Extension, MimeType>;

const MIME_EXTENSION_MAP = Object.entries(db).reduce((previousValue, [mime, { extensions }]) => {
  if (!extensions) return previousValue;
  for (const extension of extensions) {
    previousValue[extension] = mime;
  }

  return previousValue;
}, saveObject<ExtensionMimeMap>());

export const getMimeType = (path: string): string | null => {
  // Add some arbitrary string before the point in case the file is something like .gitignore
  const extension = extname(`_.${path}`).toLowerCase().substring(1);
  return MIME_EXTENSION_MAP[extension] ?? null;
};

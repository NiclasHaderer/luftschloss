import { Headers } from "./headers";
import http from "node:http";
import { Buffer } from "node:buffer";

export const satisfiesContentLength = (headers: Headers, maxBodySize: number): boolean => {
  const length = parseInt(headers.get("Content-Length") || "0");
  if (isNaN(length)) return true;
  return length <= maxBodySize;
};

export const getBodyData = async (
  raw: http.IncomingMessage,
  maxBodySize: number
): Promise<{ success: false; data: undefined } | { success: true; data: Buffer }> => {
  const buffers: Buffer[] = [];

  const currentBodySize = () => {
    return buffers.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.length;
    }, 0);
  };

  for await (const b of raw) {
    if (currentBodySize() > maxBodySize) return { success: false, data: undefined };
    buffers.push(await b);
  }

  return { success: true, data: Buffer.concat(buffers) };
};

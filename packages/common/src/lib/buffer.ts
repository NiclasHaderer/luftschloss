export const getBufferEncoding = (encoding: string | undefined): BufferEncoding | undefined => {
  if (!encoding) return undefined;
  encoding = encoding.toLowerCase();
  if (isBufferEncoding(encoding)) {
    return encoding.toLowerCase() as BufferEncoding;
  }
  return undefined;
};

export const isBufferEncoding = (encoding: string): encoding is BufferEncoding => {
  encoding = (encoding || "").toLowerCase();
  return (
    encoding === "ascii" ||
    encoding === "ascii" ||
    encoding === "utf8" ||
    encoding === "utf-8" ||
    encoding === "utf16le" ||
    encoding === "ucs2" ||
    encoding === "ucs-8" ||
    encoding === "base64" ||
    encoding === "base64url" ||
    encoding === "latin1" ||
    encoding === "binary" ||
    encoding === "hex"
  );
};

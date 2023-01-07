import { splitFirst } from "./string";
import { getBufferEncoding } from "./buffer";

// HUGE thanks to the guys at https://github.com/jshttp/content-type for this

// Content type is made up of all these allowed characters separated by a slash
const VALID_CONTENT_TYPE = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

const PARAM_REGEXP =
  // eslint-disable-next-line no-control-regex
  / *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;

// eslint-disable-next-line no-control-regex
const ESCAPED_QUOTES = /\\([\u000b\u0020-\u00ff])/g;

export type ContentTypeString = `${string}/${string}` | "*/*";

export interface ContentType {
  type: ContentTypeString | undefined;
  encoding: BufferEncoding | undefined;
  parameters: Record<string, string>;

  matches(type: ContentTypeString): boolean;
}

const extractParameters = (params: string | undefined) => {
  if (params === undefined) return {};

  const parameters: Record<string, string> = {};
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = PARAM_REGEXP.exec(params))) {
    if (match.index !== index) {
      throw new TypeError("invalid parameter format");
    }

    let [total, name, value] = match;
    index += total.length + 1;

    // Remove quotes from value
    if (value.startsWith('"')) {
      value = value.substring(1, value.length - 1).replace(ESCAPED_QUOTES, "$1");
    }
    parameters[name.toLowerCase()] = value;
  }

  if (index !== params.length + 1) {
    throw new TypeError("invalid parameter format");
  }

  return parameters;
};

/**
 * See https://www.rfc-editor.org/rfc/rfc7231#section-3.1.1.1
 *
 * @param contentTypeString
 */
export const parseContentType = (contentTypeString: string): ContentType => {
  const [contentType, params] = splitFirst(contentTypeString, ";").map(s => s.trim());
  if (!VALID_CONTENT_TYPE.test(contentType)) {
    throw new Error(`Invalid content type: "${contentTypeString}"`);
  }

  const encodedParams = extractParameters(params);
  const encoding = getBufferEncoding(encodedParams.charset);
  return {
    type: contentType.toLowerCase() as ContentTypeString,
    encoding: encoding,
    parameters: encodedParams,
    matches(type: ContentTypeString): boolean {
      if (type === "*/*") return true;
      if (!this.type) return false;
      const [contentType, specificType] = type.toLowerCase().split("/");
      const [thisContentType, thisSpecificType] = this.type.split("/");
      return (
        (contentType === "*" || contentType === thisContentType) &&
        (specificType === "*" || specificType === thisSpecificType)
      );
    },
  };
};

import {
  ClientOptions,
  ClientOptionsWithBody,
  del as delMethod,
  get as getMethod,
  head as headMethod,
  options as optionsMethod,
  patch as patchMethod,
  post as postMethod,
  put as putMethod,
  request as requestMethod,
} from "./methods";

export const luftClient = (options: ClientOptions = {}) => {
  return {
    get: (url: string | URL, newOptions: ClientOptions = {}) => getMethod(url, { ...options, ...newOptions }),
    head: (url: string | URL, newOptions: ClientOptions = {}) => headMethod(url, { ...options, ...newOptions }),
    post: (url: string | URL, newOptions: ClientOptionsWithBody = {}) => postMethod(url, { ...options, ...newOptions }),
    patch: (url: string | URL, newOptions: ClientOptionsWithBody = {}) =>
      patchMethod(url, { ...options, ...newOptions }),
    options: (url: string | URL, newOptions: ClientOptionsWithBody = {}) =>
      optionsMethod(url, { ...options, ...newOptions }),
    put: (url: string | URL, newOptions: ClientOptionsWithBody = {}) => putMethod(url, { ...options, ...newOptions }),
    del: (url: string | URL, newOptions: ClientOptionsWithBody = {}) => delMethod(url, { ...options, ...newOptions }),
    request: (method: string, url: string | URL, newOptions: ClientOptionsWithBody = {}) =>
      requestMethod(method, url, { ...options, ...newOptions }),
  } satisfies {
    get: typeof getMethod;
    post: typeof postMethod;
    patch: typeof patchMethod;
    head: typeof headMethod;
    options: typeof optionsMethod;
    put: typeof putMethod;
    del: typeof delMethod;
    request: typeof requestMethod;
  };
};

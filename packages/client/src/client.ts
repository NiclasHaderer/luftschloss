import {
  ClientOptions,
  del as delMethod,
  get as getMethod,
  head as headMethod,
  options as optionsMethod,
  patch as patchMethod,
  post as postMethod,
  put as putMethod,
} from "./methods"

export const luftClient = (options: ClientOptions = {}) => {
  return {
    get: (url: string, nweOptions: ClientOptions = {}) => getMethod(url, { ...options, ...nweOptions }),
    post: (url: string, nweOptions: ClientOptions = {}) => postMethod(url, { ...options, ...nweOptions }),
    patch: (url: string, nweOptions: ClientOptions = {}) => patchMethod(url, { ...options, ...nweOptions }),
    head: (url: string, nweOptions: ClientOptions = {}) => headMethod(url, { ...options, ...nweOptions }),
    options: (url: string, nweOptions: ClientOptions = {}) => optionsMethod(url, { ...options, ...nweOptions }),
    put: (url: string, nweOptions: ClientOptions = {}) => putMethod(url, { ...options, ...nweOptions }),
    del: (url: string, nweOptions: ClientOptions = {}) => delMethod(url, { ...options, ...nweOptions }),
  } satisfies {
    get: typeof getMethod
    post: typeof postMethod
    patch: typeof patchMethod
    head: typeof headMethod
    options: typeof optionsMethod
    put: typeof putMethod
    del: typeof delMethod
  }
}

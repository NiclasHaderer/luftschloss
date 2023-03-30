import {
  containsRegex,
  DEFAULT_PATH_VALIDATOR_NAME,
  intPathValidator,
  numberPathValidator,
  pathToRegex,
  stringPathValidator,
} from ".";

test("Contains: default parameter string", () => {
  const path1 = "hello/{world}";
  const path2 = "/hello/{world}";
  const path3 = "/hello/{world}/";
  expect(containsRegex(path1)).toBe(true);
  expect(containsRegex(path2)).toBe(true);
  expect(containsRegex(path3)).toBe(true);
});

test("Contains: explicit parameter string", () => {
  const path1 = "hello/{world:int}";
  const path2 = "/hello/{world:number}";
  const path3 = "/hello/{world:string}/";
  expect(containsRegex(path1)).toBe(true);
  expect(containsRegex(path2)).toBe(true);
  expect(containsRegex(path3)).toBe(true);
});

test("Contains: explicit no variable name", () => {
  const path1 = "hello/{:int}";
  expect(containsRegex(path1)).toBe(true);

  const path2 = "/hello/{:number}";
  expect(containsRegex(path2)).toBe(true);

  const path3 = "/hello/{:string}/";
  expect(containsRegex(path3)).toBe(true);

  const path4 = "/hello/{a:}";
  expect(containsRegex(path4)).toBe(true);
});

test("Contains: invalid", () => {
  const path1 = "/hello/{}/";
  expect(containsRegex(path1)).toBe(false);

  const path2 = "/hello/{:}";
  expect(containsRegex(path2)).toBe(false);
});

test("Convert: default parameter string", () => {
  const validators = { string: stringPathValidator(), [DEFAULT_PATH_VALIDATOR_NAME]: stringPathValidator() };

  const path1 = "hello/{world}";
  const regex1 = pathToRegex(path1, validators);
  expect(regex1).toEqual(/^\/hello\/(?<world>[^/]+)\/$/i);

  const path2 = "/hello/{world}";
  const regex2 = pathToRegex(path2, validators);
  expect(regex2).toEqual(/^\/hello\/(?<world>[^/]+)\/$/i);

  const path3 = "/hello/{world}/";
  const regex3 = pathToRegex(path3, validators);
  expect(regex3).toEqual(/^\/hello\/(?<world>[^/]+)\/$/i);
});

test("Convert: explicit parameter string", () => {
  const validators = {
    string: stringPathValidator(),
    int: intPathValidator(),
    number: numberPathValidator(),
    [DEFAULT_PATH_VALIDATOR_NAME]: stringPathValidator(),
  };

  const path1 = "hello/{world:int}";
  const regex1 = pathToRegex(path1, validators);
  expect(regex1).toEqual(/^\/hello\/(?<world>[+-]?\d+)\/$/i);

  const path2 = "/hello/{world:number}";
  const regex2 = pathToRegex(path2, validators);
  expect(regex2).toEqual(/^\/hello\/(?<world>[+-]?(?:[0-9]*\.)?[0-9]+)\/$/i);

  const path3 = "/hello/{world:string}/";
  const regex3 = pathToRegex(path3, validators);
  expect(regex3).toEqual(/^\/hello\/(?<world>[^/]+)\/$/i);
});

test("Convert: explicit no variable name", () => {
  const validators = {
    string: stringPathValidator(),
    int: intPathValidator(),
    number: numberPathValidator(),
    [DEFAULT_PATH_VALIDATOR_NAME]: stringPathValidator(),
  };

  const path1 = "hello/{:int}";
  const regex1 = pathToRegex(path1, validators);
  expect(regex1).toEqual(/^\/hello\/(?:[+-]?\d+)\/$/i);

  const path2 = "/hello/{:number}";
  const regex2 = pathToRegex(path2, validators);
  expect(regex2).toEqual(/^\/hello\/(?:[+-]?(?:[0-9]*\.)?[0-9]+)\/$/i);

  const path3 = "/hello/{:string}/";
  const regex3 = pathToRegex(path3, validators);
  expect(regex3).toEqual(/^\/hello\/(?:[^/]+)\/$/i);
});

test("Convert: To path", () => {
  const validators = { string: stringPathValidator(), [DEFAULT_PATH_VALIDATOR_NAME]: stringPathValidator() };

  const pathRegex1 = pathToRegex("/hello/{a:string}", validators);
  expect(pathRegex1).toEqual(/^\/hello\/(?<a>[^/]+)\/$/i);

  const pathRegex2 = pathToRegex("/hello/{:string}/world", validators);
  expect(pathRegex2).toEqual(/^\/hello\/(?:[^/]+)\/world\/$/i);

  const pathRegex3 = pathToRegex("/hello/{a}/world", validators);
  expect(pathRegex3).toEqual(/^\/hello\/(?<a>[^/]+)\/world\/$/i);

  const pathRegex4 = pathToRegex("/hello/{a:}/world", validators);
  expect(pathRegex4).toEqual(/^\/hello\/(?<a>[^/]+)\/world\/$/i);
});

import { parseContentTypes } from "./content-type";

const invalidTypes = [
  " ",
  "null",
  "undefined",
  "/",
  "text / plain",
  "text/;plain",
  'text/"plain"',
  "text/p£ain",
  "text/(plain)",
  "text/@plain",
  "text/plain,wrong",
];

describe("parseContentTypes(string)", () => {
  it("should parse basic type", () => {
    const type = parseContentTypes("text/html");
    expect(type.type).toBe("text/html");
  });

  it("should parse with suffix", () => {
    const type = parseContentTypes("image/svg+xml");
    expect(type.type).toBe("image/svg+xml");
  });

  it("should parse basic type with surrounding OWS", () => {
    const type = parseContentTypes(" text/html ");
    expect(type.type).toBe("text/html");
  });

  it("should parse parameters", () => {
    const type = parseContentTypes("text/html; charset=utf-8; foo=bar");
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "utf-8",
        foo: "bar",
      },
    });
  });

  it("should parse parameters with extra LWS", () => {
    const type = parseContentTypes("text/html ; charset=utf-8 ; foo=bar");
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "utf-8",
        foo: "bar",
      },
    });
  });

  it("should lower-case type", () => {
    const type = parseContentTypes("IMAGE/SVG+XML");
    expect(type.type).toBe("image/svg+xml");
  });

  it("should lower-case parameter names", () => {
    const type = parseContentTypes("text/html; Charset=UTF-8");
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "UTF-8",
      },
    });
  });

  it("should unquote parameter values", () => {
    const type = parseContentTypes('text/html; charset="UTF-8"');
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "UTF-8",
      },
    });
  });

  it("should unquote parameter values with escaped quotes", () => {
    const type = parseContentTypes('text/html; charset="UTF\\";-8"');
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: undefined,
      parameters: {
        charset: 'UTF";-8',
      },
    });
  });

  it("should unquote parameter values with escapes", () => {
    const type = parseContentTypes('text/html; charset = "UT\\F-\\\\\\"8\\""');
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: undefined,
      parameters: {
        charset: 'UTF-\\"8"',
      },
    });
  });

  it("should handle balanced quotes", () => {
    const type = parseContentTypes('text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo');
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: undefined,
      parameters: {
        param: 'charset="utf-8"; foo=bar',
        bar: "foo",
      },
    });
  });

  it(`should throw on invalid media type`, () => {
    invalidTypes.forEach(type => {
      expect(() => parseContentTypes(type)).toThrow(`Invalid content type: "${type}"`);
    });
  });

  it("should throw on invalid parameter format", () => {
    expect(() => parseContentTypes('text/plain; foo="bar')).toThrow("invalid parameter format");
    expect(() => parseContentTypes("text/plain; profile=http://localhost; foo=bar")).toThrow(
      "invalid parameter format"
    );
    expect(() => parseContentTypes("text/plain; profile=http://localhost")).toThrow("invalid parameter format");
    expect(() => parseContentTypes("text/plain;profile=http://localhost")).toThrow("invalid parameter format");
  });
});

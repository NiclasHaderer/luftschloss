import { ContentType, parseContentType } from "./content-type";

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
    const type: Partial<ContentType> = parseContentType("text/html");
    delete type.matches;
    expect(type).toStrictEqual({
      type: "text/html",
      parameters: {},
      encoding: undefined,
    });
  });

  it("should parse with suffix", () => {
    const type: Partial<ContentType> = parseContentType("image/svg+xml");
    delete type.matches;
    expect(type).toStrictEqual({
      type: "image/svg+xml",
      parameters: {},
      encoding: undefined,
    });
  });

  it("should parse basic type with surrounding OWS", () => {
    const type: Partial<ContentType> = parseContentType(" text/html ");
    delete type.matches;

    expect(type).toStrictEqual({
      type: "text/html",
      parameters: {},
      encoding: undefined,
    });
  });

  it("should parse parameters", () => {
    const type: Partial<ContentType> = parseContentType("text/html; charset=utf-8; foo=bar");
    delete type.matches;

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
    const type: Partial<ContentType> = parseContentType("text/html ; charset=utf-8 ; foo=bar");
    delete type.matches;

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
    const type: Partial<ContentType> = parseContentType("IMAGE/SVG+XML");
    delete type.matches;

    expect(type.type).toBe("image/svg+xml");
  });

  it("should lower-case parameter names", () => {
    const type: Partial<ContentType> = parseContentType("text/html; Charset=UTF-8");
    delete type.matches;

    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "UTF-8",
      },
    });
  });

  it("should unquote parameter values", () => {
    const type: Partial<ContentType> = parseContentType('text/html; charset="UTF-8"');
    delete type.matches;

    expect(type).toStrictEqual({
      type: "text/html",
      encoding: "utf-8",
      parameters: {
        charset: "UTF-8",
      },
    });
  });

  it("should unquote parameter values with escaped quotes", () => {
    const type: Partial<ContentType> = parseContentType('text/html; charset="UTF\\";-8"');
    delete type.matches;
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: undefined,
      parameters: {
        charset: 'UTF";-8',
      },
    });
  });

  it("should unquote parameter values with escapes", () => {
    const type: Partial<ContentType> = parseContentType('text/html; charset = "UT\\F-\\\\\\"8\\""');
    delete type.matches;
    expect(type).toStrictEqual({
      type: "text/html",
      encoding: undefined,
      parameters: {
        charset: 'UTF-\\"8"',
      },
    });
  });

  it("should handle balanced quotes", () => {
    const type: Partial<ContentType> = parseContentType('text/html; param="charset=\\"utf-8\\"; foo=bar"; bar=foo');
    delete type.matches;

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
      expect(() => parseContentType(type)).toThrow(`Invalid content type: "${type}"`);
    });
  });

  it("should throw on invalid parameter format", () => {
    expect(() => parseContentType('text/plain; foo="bar')).toThrow("invalid parameter format");
    expect(() => parseContentType("text/plain; profile=http://localhost; foo=bar")).toThrow("invalid parameter format");
    expect(() => parseContentType("text/plain; profile=http://localhost")).toThrow("invalid parameter format");
    expect(() => parseContentType("text/plain;profile=http://localhost")).toThrow("invalid parameter format");
  });
});

describe("Content type match", () => {
  const parsed = parseContentType("text/html; charset=utf-8; foo=bar");
  it("should match exact type", () => {
    expect(parsed.matches("text/html")).toBe(true);
  });
  it("should match exact type with different cases", () => {
    expect(parsed.matches("TEXT/HTML")).toBe(true);
  });

  it("should match with wildcard at 1st index", () => {
    expect(parsed.matches("*/Html")).toBe(true);
  });
  it("should match with wildcard at 2nd index", () => {
    expect(parsed.matches("Text/*")).toBe(true);
  });

  it("should match with wildcard at 1st and 2nd index", () => {
    expect(parsed.matches("*/*")).toBe(true);
  });

  it("should not match with wildcard at 2nd index", () => {
    expect(parsed.matches("image/*")).toBe(false);
  });
  it("should not match with wildcard at 1st ", () => {
    expect(parsed.matches("*/png")).toBe(false);
  });

  it("should not match", () => {
    expect(parsed.matches("image/png")).toBe(false);
  });
});

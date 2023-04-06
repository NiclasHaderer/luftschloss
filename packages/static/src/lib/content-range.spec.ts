import { parseRange } from "./content-range";
import { HTTPException, Status } from "@luftschloss/server";

describe("parseRange(len, str)", function () {
  it("should return -2 for invalid str", function () {
    expect(() => parseRange(200, "malformed")).toThrow(
      new HTTPException(Status.HTTP_400_BAD_REQUEST, "range header malformed")
    );
  });

  it("should return -1 if all specified ranges are invalid", function () {
    expect(() => parseRange(200, "bytes=500-20")).toThrow(
      new HTTPException(Status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE, "valid ranges are from 0 to 199")
    );
    expect(() => parseRange(200, "bytes=500-999")).toThrow(
      new HTTPException(Status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE, "valid ranges are from 0 to 199")
    );
    expect(() => parseRange(300, "bytes=500-999,1000-1499")).toThrow(
      new HTTPException(Status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE, "valid ranges are from 0 to 299")
    );
  });

  it("should parse str", function () {
    const range = parseRange(1000, "bytes=0-499");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 0, end: 499 }], partial: true });
  });

  it("should cap end at size", function () {
    const range = parseRange(200, "bytes=0-499");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 0, end: 199 }], partial: false });
  });

  it("should parse str", function () {
    const range = parseRange(1000, "bytes=40-80");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 40, end: 80 }], partial: true });
  });

  it("should parse str asking for last n bytes", function () {
    const range = parseRange(1000, "bytes=-400");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 600, end: 999 }], partial: true });
  });

  it("should parse str with only start", function () {
    const range = parseRange(1000, "bytes=400-");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 400, end: 999 }], partial: true });
  });

  it('should parse "bytes=0-"', function () {
    const range = parseRange(1000, "bytes=0-");
    expect(range).toEqual({ type: "bytes", parts: [{ start: 0, end: 999 }], partial: false });
  });

  it("should parse str with no bytes", function () {
    const range = parseRange(1000, "bytes=0-0");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([{ start: 0, end: 0 }]);
  });

  it("should parse str asking for last byte", function () {
    const range = parseRange(1000, "bytes=-1");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([{ start: 999, end: 999 }]);
  });

  it("should parse str with multiple ranges 1", function () {
    const range = parseRange(1000, "bytes=40-80,81-90,-1");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([
      { start: 40, end: 90 },
      { start: 999, end: 999 },
    ]);
  });

  it("should parse string with to large negative range", function () {
    const range = parseRange(1000, "bytes=-10000");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([{ start: 0, end: 999 }]);
  });

  it("should parse str with some invalid ranges", function () {
    const range = parseRange(200, "bytes=0-499,1000-,500-999");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([{ start: 0, end: 199 }]);
  });

  it("should parse non-byte range", function () {
    const range = parseRange(1000, "items=0-5");
    expect(range.type).toEqual("items");
    expect(range.parts).toEqual([{ start: 0, end: 5 }]);
  });
  it("should combine overlapping ranges", function () {
    const range = parseRange(150, "bytes=0-4,90-99,5-75,100-199,101-102");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([
      { start: 0, end: 75 },
      { start: 90, end: 149 },
    ]);
  });

  it("should retain original order", function () {
    const range = parseRange(150, "bytes=-1,20-100,0-1,101-120");
    expect(range.type).toEqual("bytes");
    expect(range.parts).toEqual([
      { start: 149, end: 149 },
      { start: 20, end: 120 },
      { start: 0, end: 1 },
    ]);
  });

  it("should parse str with multiple ranges 2", function () {
    const range = parseRange(1000, "bytes=40-80,81-90,-1000");
    expect(range).toEqual({
      type: "bytes",
      parts: [{ start: 0, end: 999 }],
      partial: false,
    });
  });

  it("should parse str with multiple ranges 3", function () {
    const range = parseRange(1000, "bytes=5-6,4-5,2-3");
    expect(range).toEqual({
      type: "bytes",
      parts: [{ start: 2, end: 6 }],
      partial: true,
    });
  });

  it("should parse str with multiple ranges 4", function () {
    const range = parseRange(1000, "bytes=4-5,5-6,2-3");
    expect(range).toEqual({
      type: "bytes",
      parts: [{ start: 2, end: 6 }],
      partial: true,
    });
  });
});

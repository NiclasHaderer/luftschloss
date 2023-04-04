/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LuftURL } from "./url";

describe("UrlType: coerce", () => {
  it("should coerce a string to a url", () => {
    const url = "https://www.google.com";
    const result = new LuftURL().coerce(url);
    expect(result).toBeInstanceOf(URL);
    expect(result.protocol).toBe("https:");
    expect(result.hostname).toBe("www.google.com");
  });

  it("should throw if the url is invalid", () => {
    expect(() => new LuftURL().coerce("google")).toThrow();
    expect(() => new LuftURL().coerce("some-string")).toThrow();
    expect(() => new LuftURL().coerce("1.1.1.1")).toThrow();
  });
});

describe("UrlType: validate", () => {
  it("should throw if the url is invalid", () => {
    expect(() => new LuftURL().validate("https://www.google.com")).toThrow();
    expect(() => new LuftURL().validate(null)).toThrow();
  });
  it("should not throw if the url is valid", () => {
    expect(() => new LuftURL().validate(new URL("https://www.google.com"))).not.toThrow();
    expect(() => new LuftURL().validate(new URL("https://youtube.com"))).not.toThrow();
  });

  it("should validate the protocol", () => {
    expect(() => new LuftURL().protocol("https:").validate(new URL("https://www.google.com"))).not.toThrow();
    expect(() => new LuftURL().protocol("https:").validate(new URL("http://www.google.com"))).toThrow();

    expect(() => new LuftURL().protocol(["wss:", "https:"]).validate(new URL("https://www.google.com"))).not.toThrow();
    expect(() => new LuftURL().protocol(["wss:", "https:"]).validate(new URL("wss://www.google.com"))).not.toThrow();
  });

  it("should create a new instance of the validator if the protocol is changed", () => {
    const url = new LuftURL();
    expect(url.protocol("http:")).not.toBe(url);
  });
});

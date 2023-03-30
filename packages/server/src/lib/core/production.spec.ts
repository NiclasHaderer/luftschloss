import { isProduction } from "./production";
import * as process from "process";

describe("Production", () => {
  it("should be false", () => {
    expect(isProduction()).toBe(false);
    process.env.production = "true";
    expect(isProduction()).toBe(false);
  });
});

import { HTTPException } from "./http-exception";
import { Status } from "./status";

describe("HttpException", () => {
  it("should create an instance", () => {
    const exception = new HTTPException(404, "Not found");
    expect(exception).toBeInstanceOf(HTTPException);
    expect(exception.status).toBe(Status.HTTP_404_NOT_FOUND);
    expect(exception.message).toBe("Not found");
  });

  it("should create an instance with a json message", () => {
    const exception = new HTTPException(404, { message: "Not found" });
    expect(exception).toBeInstanceOf(HTTPException);
    expect(exception.status).toBe(Status.HTTP_404_NOT_FOUND);
    expect(exception.message).toBe('{"message":"Not found"}');
  });

  it("should create an instance with a json message", () => {
    const exception = new HTTPException(404, ["Not found"]);
    expect(exception).toBeInstanceOf(HTTPException);
    expect(exception.status).toBe(Status.HTTP_404_NOT_FOUND);
    expect(exception.message).toBe('["Not found"]');
  });

  it("should wrap an error", () => {
    const error = new Error("Not found");
    const exception = HTTPException.wrap(error, 404);
    expect(exception).toBeInstanceOf(HTTPException);
    expect(exception.status).toBe(Status.HTTP_404_NOT_FOUND);
    expect(exception.message).toBe("Not found");
    expect(exception.stack).toBe(error.stack);
  });

  it("should accept a status", () => {
    const exception = new HTTPException(Status.HTTP_404_NOT_FOUND, "Not found");
    expect(exception).toBeInstanceOf(HTTPException);
    expect(exception.status).toBe(Status.HTTP_404_NOT_FOUND);
    expect(exception.message).toBe("Not found");
  });
});

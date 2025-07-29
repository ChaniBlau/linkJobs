import { BaseController } from "../../src/api/base/base.controller";

describe("BaseController", () => {
  it("should return success response", () => {
    const res = BaseController.success("Success message", [1, 2, 3]);
    expect(res).toEqual({
      success: true,
      message: "Success message",
      data: [1, 2, 3],
    });
  });

  it("should return error response", () => {
    const res = BaseController.error("Error occurred", { code: 123 });
    expect(res).toEqual({
      success: false,
      message: "Error occurred",
      error: { code: 123 },
    });
  });
});
type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  error?: any;
};

export class BaseController {
  static success<T>(message: string, data: T): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: any): ErrorResponse {
    return {
      success: false,
      message,
      error,
    };
  }
}

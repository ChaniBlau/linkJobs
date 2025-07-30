import { BaseController } from '../../api/base/base.controller';

describe('BaseController', () => {
  it('should return success response', () => {
    const data = [1, 2, 3];
    const result = BaseController.success('Success message', data);

    expect(result).toEqual({
      success: true,
      message: 'Success message',
      data: [1, 2, 3],
    });
  });

  it('should return error response with error object', () => {
    const errorObj = { code: 123 };
    const result = BaseController.error('Error occurred', errorObj);

    expect(result).toEqual({
      success: false,
      message: 'Error occurred',
      error: { code: 123 },
    });
  });

  it('should return error response without error details', () => {
    const result = BaseController.error('Simple error');

    expect(result).toEqual({
      success: false,
      message: 'Simple error',
      error: undefined,
    });
  });
});

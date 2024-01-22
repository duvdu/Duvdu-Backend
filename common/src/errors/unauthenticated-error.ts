import { CustomError } from './custom-error';

export class UnauthenticatedError extends CustomError {
  statusCode = 401;
  constructor(message?: string) {
    super(message || 'un-authenticated error');
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: 'un-authenticated error' }];
  }
}

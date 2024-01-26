import { CustomError } from './custom-error';

export class UnauthorizedError extends CustomError {
  statusCode = 403;
  constructor(message?: string) {
    super(message || 'un-unauthorized error');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message || 'un-unauthorized error' }];
  }
}

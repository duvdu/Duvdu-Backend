import { CustomError } from './custom-error';

export class UnauthorizedError extends CustomError {
  statusCode = 403;
  constructor() {
    super('un-unauthorized error');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: 'un-unauthorized error' }];
  }
}

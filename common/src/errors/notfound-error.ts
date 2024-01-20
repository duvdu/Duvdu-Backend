import { CustomError } from './custom-error';

export class NotFound extends CustomError {
  statusCode = 404;
  constructor() {
    super('not found error');
    Object.setPrototypeOf(this, NotFound.prototype);
  }
  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: 'not found error' }];
  }
}

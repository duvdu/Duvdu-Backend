import { CustomError } from './custom-error';

export class NotAllowedError extends CustomError {
  statusCode: number = 405;
  constructor(message?: string) {
    super(message || 'not allowed error');
    Object.setPrototypeOf(this, NotAllowedError.prototype);
  }
  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message || 'not allowed error' }];
  }
}

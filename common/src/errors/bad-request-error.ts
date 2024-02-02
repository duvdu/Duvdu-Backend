import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode: number = 400;
  constructor(message: string) {
    super(message || 'bad-request error');
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message || 'bad-request error' }];
  }
}

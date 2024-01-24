import { CustomError } from './custom-error';
export class GenericError extends CustomError {
  statusCode = 406;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GenericError.prototype);
  }
  serializeError(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message }];
  }
}

import { ValidationError as vError } from 'express-validator';

import { CustomError } from './custom-error';

export class ValidationError extends CustomError {
  statusCode = 422;
  constructor(public error: vError[]) {
    super('validation error');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  serializeError(): { message: string; field?: string | undefined }[] {
    return this.error.map((el) => {
      if (el.type === 'field') return { message: el.msg, field: el.path };
      return { message: el.msg };
    });
  }
}

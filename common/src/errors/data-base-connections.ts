import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  constructor(message?: string) {
    super(message || 'Error connecting to database');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeError() {
    return [
      {
        message: this.message || 'Error connecting to database',
      },
    ];
  }
}

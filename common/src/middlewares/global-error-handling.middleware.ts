import { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';

import { CustomError } from '../errors/custom-error';

// eslint-disable-next-line
export const globalErrorHandlingMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  // custom error
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ errors: err.serializeError() });
  }
  // mongo dublicate error
  if (err.name === 'MongoServerError' && err.code == '11000')
    return res
      .status(422)
      .json({ errors: [{ message: `${Object.keys(err.keyPattern)} is already exists` }] });
  // unhandled multer error
  if (err instanceof MulterError)
    return res.status(400).json({ errors: [{ message: `${err.field} is invalid` }] });
  // JWT invalid token
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ errors: [{ message: 'invalid token' }] });
  // JWT expired token
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ errors: [{ message: 'expired token' }] });
  // unHandled error
  res.status(500).json({ errors: [{ message: 'server error' }] });
};

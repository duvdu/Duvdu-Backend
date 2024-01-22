import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';


import { ValidationError } from '../errors/validation-error';

export const globalValidatorMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new ValidationError(errors.array()));
  next();
};

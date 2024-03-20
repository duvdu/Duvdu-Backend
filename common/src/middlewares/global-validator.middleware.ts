import { RequestHandler } from 'express';
import { validationResult, matchedData } from 'express-validator';

import { ValidationError } from '../errors/validation-error';

export const globalValidatorMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new ValidationError(errors.array()));
  req.body = matchedData(req, { locations: ['body'] });
  req.params = matchedData(req, { locations: ['params'] });
  req.query = matchedData(req, { locations: ['query'] });
  next();
};

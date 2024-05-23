import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param, query } from 'express-validator';

export const bookmarkParam = [
  param('bookmarkId').isMongoId(),
  query('limit').optional().isInt({min:1}),
  query('page').optional().isInt({min:1}),
  globalValidatorMiddleware];

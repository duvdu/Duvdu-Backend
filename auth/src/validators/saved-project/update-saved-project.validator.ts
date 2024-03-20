import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const updateBookmark = [
  param('bookmarkId').isMongoId(),
  body('title').exists().isString().trim().isLength({ min: 1 }),
  globalValidatorMiddleware,
];

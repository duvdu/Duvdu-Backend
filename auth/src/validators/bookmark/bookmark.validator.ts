import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  body('title').isString().isLength({ min: 1, max: 255 }),
  globalValidatorMiddleware,
];

export const update = [
  param('bookmarkId').isMongoId(),
  body('title').optional().isString().isLength({ min: 1, max: 255 }),
  globalValidatorMiddleware,
];

export const bookmarkParam = [param('bookmarkId').isMongoId(), globalValidatorMiddleware];

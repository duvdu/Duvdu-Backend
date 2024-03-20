import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const createBookmark = [
  body('title').exists().isString().isLength({ min: 1 }),
  body('projects').exists().isArray({ min: 1, max: 1 }),
  body('project.*').isMongoId(),
  globalValidatorMiddleware,
];

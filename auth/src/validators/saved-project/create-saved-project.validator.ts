import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const createBookmark = [
  body('title').isString().bail().isLength({ min: 1 }),
  body('projects').isArray(),
  body('project.*').isMongoId(),
  globalValidatorMiddleware,
];

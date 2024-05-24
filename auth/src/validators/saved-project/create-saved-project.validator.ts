import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const createBookmark = [
  body('title')
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1 })
    .custom((val) => {
      if (val === 'favourite') throw new Error('cannot use favourite name');
      return true;
    }),
  body('projects').isArray(),
  body('project.*').isMongoId(),
  globalValidatorMiddleware,
];

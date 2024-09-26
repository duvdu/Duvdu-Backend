import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const retreiveUsernameVal = [
  body('username')
    .optional()
    .isString()
    .isLength({ min: 6, max: 32 })
    .withMessage('lengthBetween')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  globalValidatorMiddleware,
];


import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const askResetPasswordVal = [
  param('username')
    .exists()
    .isString()
    .withMessage('invalid format')
    .isLength({ min: 6, max: 32 })
    .withMessage('length must be betwwen 6 and 32 character'),
  globalValidatorMiddleware,
];

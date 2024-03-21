import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const resetPasswordVal = [
  body('newPassword')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  param('username').exists().isString().isLength({ min: 6, max: 32 }),
  globalValidatorMiddleware,
];

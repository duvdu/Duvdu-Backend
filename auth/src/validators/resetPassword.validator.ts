import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const resetPasswordVal = [
  body('verificationCode').notEmpty().isLength({ min: 6, max: 6 }),
  body('newPassword')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  body('username').exists().isString().isLength({ min: 6, max: 32 }),
  globalValidatorMiddleware,
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const resetPasswordVal = [
  body('newPassword')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
    .withMessage('passwordInvalid'),
  body('login')
    .optional()
    .exists()
    .withMessage('usernameRequired')
    .isString()
    .withMessage('invalidFormat'),
  globalValidatorMiddleware,
];

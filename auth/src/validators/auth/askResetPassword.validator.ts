import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const askResetPasswordVal = [
  body('login')
    .optional()
    .exists()
    .withMessage('usernameRequired')
    .isString()
    .withMessage('invalidFormat'),
  globalValidatorMiddleware,
];

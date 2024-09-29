import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const resendCodeVal = [
  body('login').isString().withMessage('usernameString'),
  globalValidatorMiddleware,
];

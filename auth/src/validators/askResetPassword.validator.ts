import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const askResetPasswordVal = [
  body('username').exists().isString().isLength({ min: 6, max: 32 }),
  globalValidatorMiddleware,
];

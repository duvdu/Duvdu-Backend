import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const askResetPasswordVal = [
  param('username').exists().isString().isLength({ min: 6, max: 32 }),
  globalValidatorMiddleware,
];

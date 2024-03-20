import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const verify = [
  body('username').isString(),
  body('code').isString(),
  globalValidatorMiddleware,
];

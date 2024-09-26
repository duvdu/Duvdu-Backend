import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const verify = [
  body('login').optional().isString().withMessage('usernameString'),
  body('code').isString().withMessage('codeString'),
  globalValidatorMiddleware,
];

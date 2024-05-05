import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signinVal = [
  body('username').exists().isString(),
  body('password').exists().isString(),
  body('notificationToken').optional().isString(),
  globalValidatorMiddleware,
];

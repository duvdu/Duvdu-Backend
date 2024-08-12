import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signinVal = [
  body('username').exists().withMessage('usernameRequired').isString().withMessage('invalidFormat'),
  body('password').exists().withMessage('passwordRequired').isString().withMessage('invalidFormat'),
  body('notificationToken').optional().isString().withMessage('invalidFormat'),
  globalValidatorMiddleware,
];

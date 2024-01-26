import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';


export const askUpdatePhoneVal = [
  body('password').notEmpty()
    .withMessage('password required'),
  globalValidatorMiddleware
];
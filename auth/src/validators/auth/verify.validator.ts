import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const verify = [
  body('username').optional().isString().withMessage('usernameString'),
  body('phoneNumber.number')
    .optional()
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('email').optional().isEmail().withMessage('invalidEmail'),
  body('code').isString().withMessage('codeString'),
  globalValidatorMiddleware,
];

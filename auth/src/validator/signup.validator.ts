import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signupVal = [
  body('name').exists().isString().isLength({ min: 3, max: 32 }),
  body('phoneNumber').exists().isObject(),
  body('phoneNumber.key')
    .not()
    .exists()
    .customSanitizer(() => '+2'),
  body('phoneNumber.number').exists().isString().isMobilePhone('ar-EG'),
  body('username').exists().isString().isLength({ min: 6, max: 32 }),
  body('password')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  globalValidatorMiddleware,
];

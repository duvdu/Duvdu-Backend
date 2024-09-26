import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const askResetPasswordVal = [
  body('username')
    .optional()
    .exists()
    .isString()
    .withMessage('invalidFormat')
    .isLength({ min: 6, max: 32 })
    .withMessage('lengthBetween'),
  body('phoneNumber.number')
    .optional()
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('email').optional().isEmail().withMessage('invalidEmail'),
  globalValidatorMiddleware,
];

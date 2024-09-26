import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const resetPasswordVal = [
  body('newPassword')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
    .withMessage('passwordInvalid'),
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

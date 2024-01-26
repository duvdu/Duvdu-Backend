import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const verifyUpdatePhoneVal = [
  body('verificationCode')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('verificationCode must be 6 digit'),
  body('phoneNumber').isNumeric().isMobilePhone(['ar-EG']).withMessage('invalid phone number'),
  globalValidatorMiddleware,
];

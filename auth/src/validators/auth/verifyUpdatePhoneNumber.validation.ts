import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const verifyUpdatePhoneVal = [
  body('verificationCode').notEmpty().isLength({ min: 6, max: 6 }).withMessage('verificationCodeLength'),
  body('phoneNumber').isNumeric().isMobilePhone(['ar-EG']).withMessage('phoneNumberInvalid'),
  globalValidatorMiddleware,
];

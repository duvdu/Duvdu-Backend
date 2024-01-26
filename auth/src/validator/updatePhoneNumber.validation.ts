import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const updatePhoneNumberVal = [
  body('verificationCode')
    .notEmpty()
    .withMessage('verificationCode required')
    .isLength({ min: 6, max: 6 }),
  body('phoneNumber').isNumeric().isMobilePhone(['ar-EG']),
  globalValidatorMiddleware,
];

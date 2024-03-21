import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const updatePhoneNumberVal = [
  body('phoneNumber').isNumeric().isMobilePhone(['ar-EG']),
  globalValidatorMiddleware,
];

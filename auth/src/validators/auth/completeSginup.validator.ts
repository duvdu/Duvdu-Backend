import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const completeSginUpVal = [
  body('name').isString().trim().isLength({ min: 3, max: 32 }).withMessage('nameInvalid'),
  body('phoneNumber').isObject(),
  body('phoneNumber.number')
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('username')
    .isString()
    .isLength({ min: 6, max: 32 })
    .withMessage('usernameInvalid')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  globalValidatorMiddleware,
];

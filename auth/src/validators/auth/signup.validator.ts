import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signupVal = [
  body('name').isString().trim().isLength({ min: 3, max: 32 }),
  body('phoneNumber').isObject(),

  body('phoneNumber.number').exists().isString().isMobilePhone('ar-EG'),
  body('username')
    .isString()
    .isLength({ min: 6, max: 32 })
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('');
    }),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  }),

  globalValidatorMiddleware,
];

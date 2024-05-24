import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';


export const signupVal = [
  body('name').isString().trim().isLength({ min: 3, max: 32 }).withMessage('nameInvalid'),
  body('phoneNumber').isObject(),
  body('phoneNumber.number').exists().isString().isMobilePhone('ar-EG').withMessage('phoneNumberInvalid'),
  body('username')
    .isString()
    .isLength({ min: 6, max: 32 }).withMessage('lengthBetween')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  body('password').isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  }).withMessage('passwordInvalid'),
  body('notificationToken').optional().isString(),
  globalValidatorMiddleware,
];

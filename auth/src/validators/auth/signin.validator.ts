import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signinVal = [
  body('phoneNumber').isObject().optional(),
  body('phoneNumber.number')
    .optional()
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('email').optional().isEmail().withMessage('invalidEmail'),
  body('username')
    .optional()
    .exists()
    .withMessage('usernameRequired')
    .isString()
    .withMessage('invalidFormat'),
  body('password').exists().withMessage('passwordRequired').isString().withMessage('invalidFormat'),
  body('notificationToken').optional().isString().withMessage('invalidFormat'),
  globalValidatorMiddleware,
];

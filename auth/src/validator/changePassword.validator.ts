import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const changePasswordVal = [
  body('oldPassword').notEmpty(),
  body('newPassword')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  globalValidatorMiddleware,
];

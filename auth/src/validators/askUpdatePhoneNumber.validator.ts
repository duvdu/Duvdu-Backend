import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const askUpdatePhoneVal = [
  body('password')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  globalValidatorMiddleware,
];

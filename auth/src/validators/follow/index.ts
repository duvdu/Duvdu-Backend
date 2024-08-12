import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const followVal = [
  param('userId').isMongoId().withMessage('invalidFormat'),
  globalValidatorMiddleware,
];

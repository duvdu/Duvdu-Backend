import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const userIdVal = [param('userId').isMongoId().withMessage('invalidFormat'), globalValidatorMiddleware];

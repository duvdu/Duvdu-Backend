import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createTermVal = [
  check('desc').exists().isString().notEmpty().withMessage('descRequired'),
  globalValidatorMiddleware,
];

export const updateTermVal = [
  check('termId').isMongoId().withMessage('termIdInvalid'),
  check('desc').exists().isString().notEmpty().withMessage('descRequired'),
  globalValidatorMiddleware,
];

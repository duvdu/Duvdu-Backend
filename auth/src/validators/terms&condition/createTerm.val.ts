import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';


export const craeteTermVal = [
  check('desc').exists().isString().notEmpty(),
  globalValidatorMiddleware
];

export const updateTermVal = [
  check('termId').isMongoId(),
  check('desc').exists().isString().notEmpty(),
  globalValidatorMiddleware
];
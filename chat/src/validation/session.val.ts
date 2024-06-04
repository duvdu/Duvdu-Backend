import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param, query } from 'express-validator';

export const getSession = [
  param('userId').isMongoId(),
  query('limit').optional().isInt().bail().toInt(),
  query('page').optional().isInt().bail().toInt(),
  globalValidatorMiddleware,
];

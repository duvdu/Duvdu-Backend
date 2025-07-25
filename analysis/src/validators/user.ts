import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { query } from 'express-validator';

export const userAnalysisCrmValidator = [
  query('from').optional().isString().isISO8601().toDate(),
  query('to').optional().isString().isISO8601().toDate(),
  globalValidatorMiddleware,
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { query } from 'express-validator';

export const transactionAnalysisValidator = [
  query('interval')
    .optional()
    .isIn(['today', 'week', 'month', 'custom'])
    .withMessage('Interval must be one of: today, week, month, custom'),
  query('from')
    .optional()
    .isString()
    .isISO8601()
    .toDate()
    .withMessage('From date must be a valid ISO8601 date'),
  query('to')
    .optional()
    .isString()
    .isISO8601()
    .toDate()
    .withMessage('To date must be a valid ISO8601 date'),
  query('currency').optional().isString().withMessage('Currency must be a string'),
  globalValidatorMiddleware,
];

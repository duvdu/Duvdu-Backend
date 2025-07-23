import { FundedTransactionStatus, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createFundedTransactionValidation = [
  body('fundAmount').isFloat().toFloat().withMessage('fundAmount must be a number'),
  body('user').isMongoId().withMessage('user must be a valid MongoDB ID'),
  body('withdrawMethod').isMongoId().withMessage('withdrawMethod must be a valid MongoDB ID'),
  body('contract').optional().isMongoId().withMessage('contract must be a valid MongoDB ID'),
  globalValidatorMiddleware,
];

export const getFundingTransactionPaginationValidation = [
  query('user').optional().isMongoId().withMessage('user must be a valid MongoDB ID'),
  query('status')
    .optional()
    .isIn(Object.values(FundedTransactionStatus))
    .withMessage('status must be a valid status'),
  query('createdBy').optional().isMongoId().withMessage('createdBy must be a valid MongoDB ID'),
  query('fundAmountFrom')
    .optional()
    .isFloat()
    .toFloat()
    .withMessage('fundAmountFrom must be a number'),
  query('contract').optional().isMongoId().withMessage('contract must be a valid MongoDB ID'),
  query('fundAmountTo').optional().isFloat().toFloat().withMessage('fundAmountTo must be a number'),
  query('fundAmount').optional().isFloat().toFloat().withMessage('fundAmount must be a number'),
  query('createdAtFrom').optional().isISO8601().withMessage('createdAtFrom must be a valid date'),
  query('createdAtTo').optional().isISO8601().withMessage('createdAtTo must be a valid date'),
  query('limit').optional().isInt().withMessage('limit must be a number'),
  query('page').optional().isInt().withMessage('page must be a number'),
  query('ticketNumber').optional().isString().withMessage('ticketNumber must be a valid string'),
  globalValidatorMiddleware,
];

export const getFundingTransactionValidation = [
  param('transactionId').isMongoId().withMessage('transactionId must be a valid MongoDB ID'),
  globalValidatorMiddleware,
];

export const updateFundingTransactionValidation = [
  param('transactionId').isMongoId().withMessage('transactionId must be a valid MongoDB ID'),
  body('withdrawMethod').isMongoId().withMessage('withdrawMethod must be a valid MongoDB ID'),
  globalValidatorMiddleware,
];

import {
  globalValidatorMiddleware,
  MODELS,
  TransactionStatus,
  TransactionType,
} from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const transactionPaginationValidation = [
  query('user').optional().isMongoId().withMessage('User ID is required'),
  query('contract').optional().isMongoId().withMessage('Contract ID is required'),
  query('status').optional().isIn(Object.values(TransactionStatus)).withMessage('Invalid status'),
  query('type').optional().isIn(Object.values(TransactionType)).withMessage('Invalid type'),
  query('model').optional().isIn(Object.values(MODELS)).withMessage('Invalid model'),
  query('isSubscription').optional().isBoolean().toBoolean().withMessage('Invalid isSubscription'),
  query('amountFrom').optional().isFloat().toFloat().withMessage('Invalid amountFrom'),
  query('amountTo').optional().isFloat().toFloat().withMessage('Invalid amountTo'),
  query('amount').optional().isFloat().toFloat().withMessage('Invalid amount'),
  query('from').optional().isISO8601().toDate().withMessage('Invalid from date'),
  query('to').optional().isISO8601().toDate().withMessage('Invalid to date'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1 }).toInt().withMessage('Invalid limit'),
  query('ticketNumber').optional().isString().withMessage('Invalid ticketNumber'),
  globalValidatorMiddleware,
];

export const getOneTransaction = [
  param('transactionId').isMongoId().withMessage('Invalid transaction ID'),
  globalValidatorMiddleware,
];

export const userTransactionPaginationValidation = [
  query('status').optional().isIn(Object.values(TransactionStatus)).withMessage('Invalid status'),
  query('type').optional().isIn(Object.values(TransactionType)).withMessage('Invalid type'),
  query('model').optional().isIn(Object.values(MODELS)).withMessage('Invalid model'),
  query('isSubscription').optional().isBoolean().toBoolean().withMessage('Invalid isSubscription'),
  query('amountFrom').optional().isFloat().toFloat().withMessage('Invalid amountFrom'),
  query('amountTo').optional().isFloat().toFloat().withMessage('Invalid amountTo'),
  query('amount').optional().isFloat().toFloat().withMessage('Invalid amount'),
  query('from').optional().isISO8601().toDate().withMessage('Invalid from date'),
  query('to').optional().isISO8601().toDate().withMessage('Invalid to date'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1 }).toInt().withMessage('Invalid limit'),
  globalValidatorMiddleware,
];

export const fundTransactionValidation = [
  param('transactionId').isMongoId().withMessage('Invalid transaction ID'),
  body('fundingAmount').isFloat({ min: 0 }).toFloat().withMessage('Invalid funding amount'),
  globalValidatorMiddleware,
];

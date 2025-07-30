import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('contractId').isMongoId(),
  body('desc').optional().isString(),
  globalValidatorMiddleware,
];

export const getOne = [param('id').isMongoId(), globalValidatorMiddleware];

export const getAll = [
  query('limit').optional().isInt().toInt(),
  query('page').optional().isInt().toInt(),
  query('search').optional().isString(),
  query('addedBy').optional().isMongoId(),
  query('closedBy').optional().isMongoId(),
  query('reporter').optional().isMongoId(),
  query('contract').optional().isMongoId(),
  query('startDate').optional().isDate().toDate(),
  query('endDate').optional().isDate().toDate(),
  query('ticketNumber').optional().isString(),
  query('isClosed').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const close = [
  param('id').isMongoId(),
  body('feedback').optional().isString(),
  body('sendNotification').optional().isBoolean(),
  globalValidatorMiddleware,
];

export const updateComplaint = [
  param('id').isMongoId(),
  body('feedback').isString(),
  body('sendNotification').optional().isBoolean(),
  globalValidatorMiddleware,
];

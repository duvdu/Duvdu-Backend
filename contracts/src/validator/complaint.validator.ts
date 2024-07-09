import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('contractId').isMongoId(),
  body('desc').optional().isString(),
  globalValidatorMiddleware,
];

export const getOne = [param('complaintId').isMongoId(), globalValidatorMiddleware];

export const getAll = [
  query('limit').optional().isInt().toInt(),
  query('page').optional().isInt().toInt(),
  globalValidatorMiddleware,
];

export const close = [
  param('complaintId').isMongoId(),
  body('feedback').optional().isString(),
  globalValidatorMiddleware,
];

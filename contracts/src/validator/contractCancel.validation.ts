import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createContractCancelValidation = [
  body('contract').isMongoId().withMessage('contract is required'),
  body('cancelReason').isString().withMessage('cancelReason is required'),
  globalValidatorMiddleware,
];

export const getContractCancelValidation = [
  param('contractCancelId').isMongoId().withMessage('contractCancelId is required'),
  globalValidatorMiddleware,
];

export const deleteContractCancelValidation = [
  param('contractCancelId').isMongoId().withMessage('contractCancelId is required'),
  globalValidatorMiddleware,
];

export const acceptContractCancelValidation = [
  param('contractCancelId').isMongoId().withMessage('contractCancelId is required'),
  globalValidatorMiddleware,
];

export const getContractsCancelValidation = [
  query('user').optional().isMongoId().withMessage('user is required'),
  query('contract').optional().isMongoId().withMessage('contract is required'),
  query('search').optional().isString().withMessage('search is required'),
  query('page').optional().isInt().withMessage('page is required'),
  query('limit').optional().isInt().withMessage('limit is required'),
  globalValidatorMiddleware,
];

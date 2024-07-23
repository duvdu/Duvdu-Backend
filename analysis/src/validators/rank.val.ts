import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createRankVal = [
  body('rank').isString().exists().withMessage('rank'),
  body('actionCount').isInt({ min: 0 }).withMessage('actionCount'),
  body('color').exists().isString(),
  globalValidatorMiddleware,
];

export const updateRankVal = [
  param('rankId').isMongoId().withMessage('rankId'),
  body('rank').optional().isString().exists().withMessage('rank'),
  body('actionCount').optional().isInt({ min: 0 }).withMessage('actionCount'),
  body('color').optional().exists().isString(),
  globalValidatorMiddleware,
];

export const getRankVal = [
  param('rankId').isMongoId().withMessage('rankId'),
  globalValidatorMiddleware,
];

export const deleteRankVal = [
  param('rankId').isMongoId().withMessage('rankId'),
  globalValidatorMiddleware,
];

export const validateRanksQuery = [
  query('actionCountFrom').optional().isInt({ min: 0 }).withMessage('actionCountFrom'),
  query('actionCountTo').optional().isInt({ min: 0 }).withMessage('actionCountTo'),
  query('rank').optional().isString().withMessage('rank'),
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  globalValidatorMiddleware,
];

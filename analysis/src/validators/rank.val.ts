import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createRankVal = [
  body('rank').isString().exists().withMessage('rank'),
  body('actionCount').isInt({ min: 0 }).withMessage('actionCount'),
  body('projectsCount').isInt({ min: 0 }).withMessage('projectsCount'),
  body('projectsLiked').isInt({ min: 0 }).withMessage('projectsLiked'),
  body('color').exists().isString(),
  globalValidatorMiddleware,
];

export const updateRankVal = [
  param('rankId').isMongoId().withMessage('rankId'),
  body('rank').optional().isString().exists().withMessage('rank'),
  body('actionCount').optional().isInt({ min: 0 }).withMessage('actionCount'),
  body('projectsCount').optional().isInt({ min: 0 }).withMessage('projectsCount'),
  body('projectsLiked').optional().isInt({ min: 0 }).withMessage('projectsLiked'),
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
  query('projectsCountFrom').optional().isInt({ min: 0 }).withMessage('projectsCountFrom'),
  query('projectsCountTo').optional().isInt({ min: 0 }).withMessage('projectsCountTo'),
  query('projectsLikedFrom').optional().isInt({ min: 0 }).withMessage('projectsLikedFrom'),
  query('projectsLikedTo').optional().isInt({ min: 0 }).withMessage('projectsLikedTo'),
  query('rank').optional().isString().withMessage('rank'),
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  globalValidatorMiddleware,
];

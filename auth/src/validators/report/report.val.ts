import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createReportVal = [
  check('project').isMongoId().withMessage('projectInvalid'),
  check('desc').isString().isLength({ min: 10, max: 100 }).withMessage('descLength'),
  globalValidatorMiddleware,
];

export const getAllReportsVal = [
  check('searchKeywords').optional().isArray({ min: 1 }).withMessage('searchKeywordsArray'),
  check('startDate').optional().isISO8601().toDate().withMessage('startDateISO8601'),
  check('endDate').optional().isISO8601().toDate().withMessage('endDateISO8601'),
  check('isClosed').optional().isBoolean().withMessage('isClosedBoolean'),
  check('closedBy').optional().isMongoId().withMessage('closedByInvalid'),
  check('sourceUser').optional().isMongoId().withMessage('sourceUserInvalid'),
  check('feedback').optional().isString().withMessage('feedbackLength'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInt'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInt'),
  globalValidatorMiddleware,
];

export const updateReportVal = [
  check('reportId').isMongoId().withMessage('reportIdInvalid'),
  check('feedback').isString().isLength({ min: 5, max: 50 }).withMessage('feedbackLength'),
  globalValidatorMiddleware,
];

export const getReportVal = [
  check('reportId').isMongoId().withMessage('reportIdInvalid'),
  globalValidatorMiddleware,
];

export const deleteReportVal = [
  check('reportId').isMongoId().withMessage('reportIdInvalid'),
  globalValidatorMiddleware,
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';



export const createReportVal = [
  check('project').isMongoId(),
  check('desc').isString().isLength({min:10 , max:100}),
  globalValidatorMiddleware
];

export const getAllReportsVal = [
  check('searchKeywords').optional().isArray({min:1}),
  check('startDate').optional().isISO8601().toDate(),
  check('endDate').optional().isISO8601().toDate(),
  check('isClosed').optional().isBoolean(),
  check('closedById').optional().isMongoId(),
  check('sourceUser').optional().isMongoId(),
  check('feedback').optional().isString(),
  globalValidatorMiddleware
];


export const updateReportVal = [
  check('reportId').isMongoId(),
  check('feedback').isString().isLength({min:5 , max:50}),
  globalValidatorMiddleware
];

export const getReportVal = [
  check('reportId').isMongoId(),
  globalValidatorMiddleware
];
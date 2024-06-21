import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';





export const create = [
  body('address').isString().exists(),
  body('description').isString().exists(),
  body('category').isMongoId(),
  body('creatives').optional().isArray({min:1}),
  body('creatives.*').isMongoId(),
  body('functions').isArray({min:1}),
  body('functions.*').isObject(),
  body('functions.*.name').isString().exists(),
  body('functions.*.unitPrice').isFloat({min:1}),
  body('tools').isArray({min:1}),
  body('tools.*').isObject(),
  body('tools.*.name').isString().exists(),
  body('tools.*.unitPrice').isFloat({min:1}),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().bail().trim().isLength({ min: 3 }),
  body('insurance').isFloat({ min: 0 }).bail().toFloat(),
  body('showOnHome').optional().isBoolean().bail().toBoolean(),
  body('projectScale').isObject(),
  body('projectScale.unit').isString().bail().trim(),
  body('projectScale.minimum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.maximum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.pricerPerUnit').isFloat({ gt: 0 }).bail().toFloat(),
  body('subCategoryId').isMongoId(),
  body('tagsId').isArray({min:1}),
  body('tagsId.*').isMongoId(),
  body('subCategory').not().exists(),
  body('tags').not().exists(),
  globalValidatorMiddleware
];


export const update = [
  param('projectId').isMongoId(),
  body('address').optional().isString().exists(),
  body('description').optional().isString().exists(),
  body('location').optional().isObject(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('searchKeywords').optional().optional().isArray(),
  body('searchKeywords.*').optional().isString().bail().trim().isLength({ min: 3 }),
  body('insurance').optional().isFloat({ min: 0 }).bail().toFloat(),
  body('showOnHome').optional().optional().isBoolean().bail().toBoolean(),
  body('projectScale').optional().isObject(),
  body('projectScale.unit').isString().bail().trim(),
  body('projectScale.minimum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.maximum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.pricerPerUnit').isFloat({ gt: 0 }).bail().toFloat(),
  globalValidatorMiddleware
];

export const getProject = [
  param('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const getAll = [
  query('searchKeywords').optional().isArray(),
  query('searchKeywords.*').optional().isString(),
  query('location.lat').optional().isNumeric(),
  query('location.lng').optional().isNumeric(),
  query('category').optional().isMongoId(),
  query('showOnHome').optional().isBoolean(),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('projectScaleMin').optional().isNumeric(),
  query('projectScaleMax').optional().isNumeric(),
  globalValidatorMiddleware
];

export const getProjectAnalysis = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  globalValidatorMiddleware
];
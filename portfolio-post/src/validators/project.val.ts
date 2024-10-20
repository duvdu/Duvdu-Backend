import { globalValidatorMiddleware, InviteStatus } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const create = [
  body('address').isString().exists().withMessage('address'),
  body('name').isString().exists().withMessage('name'),
  body('description').isString().exists().withMessage('description'),
  body('category').isMongoId().withMessage('category'),
  body('creatives').optional().isArray({ min: 1 }).withMessage('creatives'),
  body('creatives.*.creative').isMongoId().withMessage('creatives'),
  body('invitedCreatives').optional().isArray({ min: 1 }),
  body('invitedCreatives.*.number').exists().isString().isMobilePhone('ar-EG'),
  body('functions').optional().isArray({ min: 1 }).withMessage('functions'),
  body('functions.*').isObject().withMessage('functions'),
  body('functions.*.name').isString().exists().withMessage('functions'),
  body('functions.*.unitPrice').isFloat({ min: 1 }).withMessage('functions'),
  body('tools').optional().isArray({ min: 1 }).withMessage('tools'),
  body('tools.*').isObject().withMessage('tools'),
  body('tools.*.name').isString().exists().withMessage('tools'),
  body('tools.*.unitPrice').isFloat({ min: 1 }).withMessage('tools'),
  body('location').isObject().withMessage('location'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('location'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('location'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywords'),
  body('searchKeywords.*')
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage('searchKeywords'),
  body('duration').isInt({ min: 1 }).withMessage('insurance'),
  body('showOnHome').optional().isBoolean().bail().toBoolean().withMessage('showOnHome'),
  body('projectScale').isObject().withMessage('projectScale'),
  body('projectScale.unit').isString().bail().trim().withMessage('projectScale'),
  body('projectScale.minimum').isInt({ min: 1 }).bail().toInt().withMessage('projectScale'),
  body('projectScale.maximum').isInt({ min: 1 }).bail().toInt().withMessage('projectScale'),
  body('projectScale.current').isInt({ min: 1 }).bail().toInt().withMessage('projectScale'),
  body('projectScale.pricerPerUnit')
    .isFloat({ gt: 0 })
    .bail()
    .toFloat()
    .withMessage('projectScale'),
  body('subCategoryId').optional().isMongoId().withMessage('subCategoryId'),
  body('tagsId').optional().isArray({ min: 1 }).withMessage('tagsId'),
  body('tagsId.*').isMongoId().withMessage('tagsId'),
  body('subCategory').not().exists().withMessage('subCategory'),
  body('tags').not().exists().withMessage('tags'),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('address').optional().isString().exists().withMessage('address'),
  body('name').optional().isString().exists().withMessage('name'),
  body('description').optional().isString().exists().withMessage('description'),
  body('location').optional().isObject().withMessage('location'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .bail()
    .toFloat()
    .withMessage('location'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .bail()
    .toFloat()
    .withMessage('location'),
  body('searchKeywords').optional().optional().isArray().withMessage('searchKeywords'),
  body('searchKeywords.*')
    .optional()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage('searchKeywords'),
  body('duration').isInt({ min: 1 }).withMessage('insurance'),
  body('showOnHome').optional().optional().isBoolean().bail().toBoolean().withMessage('showOnHome'),
  body('projectScale').optional().isObject().withMessage('projectScale'),
  body('projectScale.unit').optional().isString().bail().trim().withMessage('projectScale'),
  body('projectScale.minimum')
    .optional()
    .isInt({ min: 1 })
    .bail()
    .toInt()
    .withMessage('projectScale'),
  body('projectScale.maximum')
    .optional()
    .isInt({ min: 1 })
    .bail()
    .toInt()
    .withMessage('projectScale'),
  body('projectScale.current')
    .optional()
    .isInt({ min: 1 })
    .bail()
    .toInt()
    .withMessage('projectScale'),
  body('projectScale.pricerPerUnit')
    .optional()
    .isFloat({ gt: 0 })
    .bail()
    .toFloat()
    .withMessage('projectScale'),
  globalValidatorMiddleware,
];

export const getProject = [
  param('projectId').isMongoId().withMessage('projectId'),
  globalValidatorMiddleware,
];

export const getAll = [
  query('instant').optional().isBoolean().toBoolean(),
  query('search').optional().isString().withMessage('searchKeywords'),
  query('location.lat').optional().isFloat().toFloat().withMessage('location'),
  query('location.lng').optional().isFloat().toFloat().withMessage('location'),
  query('showOnHome').optional().isBoolean().withMessage('showOnHome'),
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  query('duration').optional().isInt({ gt: 0 }).toInt(),
  query('projectScaleMin').optional().isInt({ gt: 0 }).toInt().withMessage('projectScale'),
  query('projectScaleMax').optional().isInt({ gt: 0 }).toInt().withMessage('projectScale'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit'),
  query('page').optional().isInt({ min: 1 }).withMessage('page'),
  query('category')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  query('tags')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  query('subCategory')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  query('maxBudget').optional().isInt({ gt: 0 }).toInt().withMessage('maxBudgetOptionalNumeric'),
  query('minBudget').optional().isInt({ gt: 0 }).toInt().withMessage('minBudgetOptionalNumeric'),
  globalValidatorMiddleware,
];

export const getProjectAnalysis = [
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  globalValidatorMiddleware,
];

export const invitationAction = [
  body('status').isIn([InviteStatus.accepted, InviteStatus.rejected]),
  globalValidatorMiddleware,
];

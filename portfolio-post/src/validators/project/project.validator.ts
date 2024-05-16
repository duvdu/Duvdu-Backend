import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('title').isString().bail().trim().isLength({ min: 3 }),
  body('desc').optional().isString().bail().trim(),
  body('tools').optional().isArray(),
  body('tools.*.name').isString().bail().trim().isLength({ min: 2 }),
  body('tools.*.fees').isFloat({ gt: 0 }).bail().toFloat(),
  body('address').optional().isString().bail().trim(),
  body('creatives').optional().isArray(),
  body('creatives.*.creative').isMongoId(),
  body('creatives.*.fees').isFloat({ gt: 0 }).bail().toFloat(),
  body('projectBudget').isFloat({ gt: 0 }).bail().toFloat(),
  body('category').isMongoId(),
  body('subCategory').isMongoId(),
  body('tags').isArray({ min: 1 }),
  body('tags.*').isString().bail().trim().isLength({ min: 3 }),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('projectScale').isObject(),
  body('projectScale.scale').isInt().bail().toInt(),
  body('projectScale.time')
    .isString()
    .bail()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error();
    }),
  body('invitedCreatives').optional().isArray(),
  body('invitedCreatives.*.phoneNumber').isObject(),
  body('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG'),
  body('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  body('showOnHome').isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 3 }),
  body('desc').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('creatives').optional().isArray(),
  body('creatives.*.creative').isMongoId(),
  body('creatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  body('projectBudget').optional().isFloat({ gt: 0 }).toFloat(),
  body('projectScale')
    .optional()
    .isObject()
    .custom((val) => {
      if (!val.scale || !val.time) throw new Error('');
      return true;
    }),
  body('projectScale.scale').optional().isInt().toInt(),
  body('projectScale.time')
    .optional()
    .isString()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error();
    }),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('showOnHome').optional().isBoolean().toBoolean(),
  body('tools').optional().isArray(),
  body('tools.*.name').isString().trim().isLength({ min: 2 }),
  body('tools.*.fees').isFloat({ gt: 0 }).toFloat(),
  body('tags').optional().isArray(),
  body('tags.*').isString().trim().isLength({ min: 3 }),
  body('isDeleted').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const findAll = [
  query('search').optional().isLength({ min: 3 }),
  query('address').optional().isLength({ min: 3 }),
  query('tools')
    .optional()
    .isLength({ min: 3 })
    .customSanitizer((val) => val.split(',')),
  query('tags')
    .optional()
    .isLength({ min: 3 })
    .customSanitizer((val) => val.split(',')),
  query('projectBudgetFrom').optional().isFloat({ gt: 0 }).toFloat(),
  query('projectBudgetTo').optional().isFloat({ gt: 0 }).toFloat(),
  query('category').optional().isMongoId(),
  query('creative').optional().isMongoId(),
  query('startDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date(0))),
  query('endDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date())),
  query('tags').optional().isString(),
  query('subCategory').optional().isString(),
  globalValidatorMiddleware,
];

export const findAllCrm = [
  ...findAll.slice(0, -1),
  query('isDeleted').optional().isBoolean().toBoolean(),
  query('showOnHome').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const get = [param('projectId').isMongoId(), globalValidatorMiddleware];

export const analysis = [
  query('startDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date(0))),
  query('endDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date())),
];

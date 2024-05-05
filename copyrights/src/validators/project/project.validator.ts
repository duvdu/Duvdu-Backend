import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('category').isMongoId(),
  body('price').isFloat({ gt: 0 }),
  body('duration').isInt(),
  body('address').optional().isString().trim(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('showOnHome').isBoolean().toBoolean(),
  body('tags').isArray(),
  body('tags.*').isString().trim().isLength({ min: 3 }),
  body('subCategory').isMongoId(),
  body('location.lat').isFloat({ min: -90, max: 90 }),
  body('location.lng').isFloat({ min: -180, max: 180 }),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId(),
  body('price').optional().isFloat({ gt: 0 }),
  body('duration').optional().isInt(),
  body('address').optional().isString().trim(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('showOnHome').optional().isBoolean().toBoolean(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  globalValidatorMiddleware,
];

export const findAll = [
  query('search').optional().isLength({ min: 3 }),
  query('address').optional().isLength({ min: 3 }),
  query('user').optional().isMongoId(),
  query('priceFrom').optional().isFloat({ gt: 0 }).toFloat(),
  query('priceTo').optional().isFloat({ gt: 0 }).toFloat(),
  query('category').optional().isMongoId(),
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

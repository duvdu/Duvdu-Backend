import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('category').isMongoId().withMessage('categoryInvalid'),
  body('price').isFloat({ gt: 0 }).withMessage('priceInvalid'),
  body('duration').isInt().withMessage('durationInvalid'),
  body('address').optional().isString().trim().withMessage('addressString'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }).withMessage('searchKeywordLength'),
  body('showOnHome').isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  body('tags').isArray().withMessage('tagsArray'),
  body('tags.*').isString().trim().isLength({ min: 3 }).withMessage('tagLength'),
  body('subCategory').isMongoId().withMessage('subCategoryInvalid'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('lngInvalid'),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('priceInvalid'),
  body('duration').optional().isInt().withMessage('durationInvalid'),
  body('address').optional().isString().trim().withMessage('addressString'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }).withMessage('searchKeywordLength'),
  body('showOnHome').optional().isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('latInvalid'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('lngInvalid'),
  globalValidatorMiddleware,
];

export const findAll = [
  query('search').optional().isLength({ min: 3 }).withMessage('searchLength'),
  query('address').optional().isLength({ min: 3 }).withMessage('addressLength'),
  query('user').optional().isMongoId().withMessage('userInvalid'),
  query('priceFrom').optional().isFloat({ gt: 0 }).toFloat().withMessage('priceFromInvalid'),
  query('priceTo').optional().isFloat({ gt: 0 }).toFloat().withMessage('priceToInvalid'),
  query('category').optional().isMongoId().withMessage('categoryInvalid'),
  query('startDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date(0)))
    .withMessage('startDateISO8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date()))
    .withMessage('endDateISO8601'),
  query('tags').optional().isString().withMessage('tagsString'),
  query('subCategory').optional().isString().withMessage('subCategoryString'),
  query('limit').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  globalValidatorMiddleware,
];

export const findAllCrm = [
  ...findAll.slice(0, -1),
  query('isDeleted').optional().isBoolean().toBoolean(),
  query('showOnHome').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const get = [param('projectId').isMongoId().withMessage('projectIdInvalid'), globalValidatorMiddleware];

export const analysis = [
  query('startDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date(0)))
    .withMessage('startDateISO8601'),
  query('endDate')
    .optional()
    .isISO8601()
    .customSanitizer((val) => (val ? new Date(val) : new Date()))
    .withMessage('endDateISO8601'),
];

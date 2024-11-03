import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const create = [
  body('category').isMongoId().withMessage('categoryInvalid'),
  body('price').isFloat({ gt: 0 }).withMessage('priceInvalid'),
  body('duration').isObject(),
  body('duration.value').isInt({ gt: 0 }),
  body('duration.unit')
    .isString()
    .bail()
    .custom((val) => {
      if (['minutes', 'hours', 'days', 'months', 'weeks'].includes(val)) return true;
      throw new Error('durationUnit');
    }),
  body('address').optional().isString().trim().withMessage('addressString'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('searchKeywordLength'),
  body('showOnHome').isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  body('tags').optional().isArray().withMessage('tagsArray'),
  body('tags.*').isMongoId().withMessage('tagLength'),
  body('subCategory').optional().isMongoId().withMessage('subCategoryInvalid'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('lngInvalid'),
  body('maxBudget').optional().isInt().withMessage('maxBudgetInt'),
  body('minBudget')
    .optional()
    .isInt()
    .custom((val, { req }) => {
      if (req.body.maxBudget > val) return true;
      throw new Error('minBudgetCustom');
    }),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('priceInvalid'),
  body('duration').optional().isObject(),
  body('duration.value').optional().isInt({ gt: 0 }),
  body('duration.unit')
    .optional()
    .isString()
    .bail()
    .custom((val) => {
      if (['minutes', 'hours', 'days', 'months', 'weeks'].includes(val)) return true;
      throw new Error('durationUnit');
    }),
  body('address').optional().isString().trim().withMessage('addressString'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('searchKeywordLength'),
  body('showOnHome').optional().isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('latInvalid'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('lngInvalid'),
  globalValidatorMiddleware,
];

export const findAll = [
  query('maxDistance').optional().isInt({ min: 1, max: 1000 }).bail().toInt(),
  query('instant').optional().isBoolean().toBoolean(),
  query('search').optional().isLength({ min: 3 }).withMessage('searchLength'),
  query('address').optional().isLength({ min: 3 }).withMessage('addressLength'),
  query('user').optional().isMongoId().withMessage('userInvalid'),
  query('priceFrom').optional().isFloat({ gt: 0 }).toFloat().withMessage('priceFromInvalid'),
  query('priceTo').optional().isFloat({ gt: 0 }).toFloat().withMessage('priceToInvalid'),
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
  query('limit').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('duration').optional().isInt({ gt: 0 }).toInt(),
  query('maxBudget').optional().isInt({ gt: 0 }).toInt().withMessage('maxBudgetOptionalNumeric'),
  query('minBudget').optional().isInt({ gt: 0 }).toInt().withMessage('minBudgetOptionalNumeric'),
  globalValidatorMiddleware,
];

export const findAllCrm = [
  ...findAll.slice(0, -1),
  query('isDeleted').optional().isBoolean().toBoolean(),
  query('showOnHome').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const get = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  globalValidatorMiddleware,
];

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

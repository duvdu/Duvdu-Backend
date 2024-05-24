import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('title').isString().bail().trim().isLength({ min: 3 }).withMessage('titleInvalid'),
  body('desc').optional().isString().bail().trim().withMessage('descString'),
  body('tools').optional().isArray().withMessage('toolsArray'),
  body('tools.*.name').isString().bail().trim().isLength({ min: 2 }).withMessage('toolNameInvalid'),
  body('tools.*.fees').isFloat({ gt: 0 }).bail().toFloat().withMessage('toolFeesInvalid'),
  body('address').optional().isString().bail().trim().withMessage('addressString'),
  body('creatives').optional().isArray().withMessage('creativesArray'),
  body('creatives.*.creative').isMongoId().withMessage('creativeInvalid'),
  body('creatives.*.fees').isFloat({ gt: 0 }).bail().toFloat().withMessage('creativeFeesInvalid'),
  body('projectBudget').isFloat({ gt: 0 }).bail().toFloat().withMessage('projectBudgetInvalid'),
  body('category').isMongoId().withMessage('categoryInvalid'),
  body('subCategory').isMongoId().withMessage('subCategoryInvalid'),
  body('tags').isArray({ min: 1 }).withMessage('tagsArray'),
  body('tags.*').isString().bail().trim().isLength({ min: 3 }).withMessage('tagLengthInvalid'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('lngInvalid'),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }).withMessage('searchKeywordLengthInvalid'),
  body('projectScale').isObject().withMessage('projectScaleObject'),
  body('projectScale.scale').isInt().bail().toInt().withMessage('projectScaleScaleInvalid'),
  body('projectScale.time')
    .isString()
    .bail()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error('projectScaleTimeInvalid');
    }),
  body('invitedCreatives').optional().isArray().withMessage('invitedCreativesArray'),
  body('invitedCreatives.*.phoneNumber').isObject().withMessage('phoneNumberObject'),
  body('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG').withMessage('phoneNumberInvalid'),
  body('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('invitedCreativesFeesInvalid'),
  body('showOnHome').isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('title').optional().isString().trim().isLength({ min: 3 }).withMessage('titleInvalid'),
  body('desc').optional().isString().trim().withMessage('descString'),
  body('address').optional().isString().trim().withMessage('addressString'),
  body('creatives').optional().isArray().withMessage('creativesArray'),
  body('creatives.*.creative').isMongoId().withMessage('creativeInvalid'),
  body('creatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('creativeFeesInvalid'),
  body('projectBudget').optional().isFloat({ gt: 0 }).toFloat().withMessage('projectBudgetInvalid'),
  body('projectScale')
    .optional()
    .isObject()
    .custom((val) => {
      if (!val.scale || !val.time) throw new Error('');
      return true;
    })
    .withMessage('projectScaleObject'),
  body('projectScale.scale').optional().isInt().toInt().withMessage('projectScaleScaleInvalid'),
  body('projectScale.time')
    .optional()
    .isString()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error('projectScaleTimeInvalid');
    }),
  body('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }).withMessage('searchKeywordLengthInvalid'),
  body('showOnHome').optional().isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  body('tools').optional().isArray().withMessage('toolsArray'),
  body('tools.*.name').isString().trim().isLength({ min: 2 }).withMessage('toolNameInvalid'),
  body('tools.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('toolFeesInvalid'),
  body('tags').optional().isArray().withMessage('tagsArray'),
  body('tags.*').isString().trim().isLength({ min: 3 }).withMessage('tagLengthInvalid'),
  body('isDeleted').optional().isBoolean().toBoolean().withMessage('isDeletedBoolean'),
  globalValidatorMiddleware,
];

export const findAll = [
  query('search').optional().isLength({ min: 3 }).withMessage('searchLengthInvalid'),
  query('address').optional().isLength({ min: 3 }).withMessage('addressLengthInvalid'),
  query('tools')
    .optional()
    .isLength({ min: 3 })
    .customSanitizer((val) => val.split(','))
    .withMessage('toolsSplitInvalid'),
  query('tags')
    .optional()
    .isLength({ min: 3 })
    .customSanitizer((val) => val.split(','))
    .withMessage('tagsSplitInvalid'),
  query('projectBudgetFrom').optional().isFloat({ gt: 0 }).toFloat().withMessage('projectBudgetFromInvalid'),
  query('projectBudgetTo').optional().isFloat({ gt: 0 }).toFloat().withMessage('projectBudgetToInvalid'),
  query('category').optional().isMongoId().withMessage('categoryInvalid'),
  query('creative').optional().isMongoId().withMessage('creativeInvalid'),
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
  query('tags').optional().isString().  withMessage('tagsStringInvalid'),
  query('subCategory').optional().isString().withMessage('subCategoryStringInvalid'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limitInvalid'),
  query('page').optional().isInt({ min: 1 }).withMessage('pageInvalid'),
  globalValidatorMiddleware,
];

export const findAllCrm = [
  ...findAll.slice(0, -1),
  query('isDeleted').optional().isBoolean().toBoolean().withMessage('isDeletedBoolean'),
  query('showOnHome').optional().isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
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


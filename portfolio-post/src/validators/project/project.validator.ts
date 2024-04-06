import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  body('title').isString().trim().isLength({ min: 3 }),
  body('desc').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('category').isMongoId(),
  body('creatives').isArray(),
  body('creatives.*.creative').isMongoId(),
  body('creatives.*.fees').isFloat({ gt: 0 }),
  body('invitedCreatives').isArray(),
  body('invitedCreatives.*.phoneNumber').isObject(),
  body('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG'),
  body('invitedCreatives.*.fees').isFloat({ gt: 0 }),
  body('projectBudget').isFloat({ gt: 0 }),
  body('projectScale').isObject(),
  body('projectScale.scale').isInt(),
  body('projectScale.time')
    .isString()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error();
    }),
  body('searchKeywords').isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('showOnHome').isBoolean(),
  body('tools').isArray(),
  body('tools.*.name').isString().trim().isLength({ min: 2 }),
  body('tools.*.fees').isFloat({ gt: 0 }),
  body('tags').isArray(),
  body('tags.*').isString().trim().isLength({ min: 3 }),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 3 }),
  body('desc').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('creatives').optional().isArray(),
  body('creatives.*.creative').isMongoId(),
  body('creatives.*.fees').isFloat({ gt: 0 }),
  body('projectBudget').optional().isFloat({ gt: 0 }),
  body('projectScale')
    .optional()
    .isObject()
    .custom((val) => {
      if (!val.scale || !val.time) throw new Error('');
      return true;
    }),
  body('projectScale.scale').optional().isInt(),
  body('projectScale.time')
    .optional()
    .isString()
    .trim()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error();
    }),
  body('searchKeywords').isArray(),
  body('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  body('showOnHome').optional().isBoolean(),
  body('tools').optional().isArray(),
  body('tools.*.name').isString().trim().isLength({ min: 2 }),
  body('tools.*.fees').isFloat({ gt: 0 }),
  body('tags').optional().isArray(),
  body('tags.*').isString().trim().isLength({ min: 3 }),
  globalValidatorMiddleware,
];

export const get = [param('projectId').isMongoId(), globalValidatorMiddleware];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('name.ar').isString().notEmpty(),
  body('name.en').isString().notEmpty(),
  globalValidatorMiddleware,
];

export const update = [
  param('platformId').isMongoId(),
  body('name.ar').isString().notEmpty(),
  body('name.en').isString().notEmpty(),
  globalValidatorMiddleware,
];

export const getOne = [param('platformId').isMongoId(), globalValidatorMiddleware];

export const getAll = [
  query('limit').optional().isInt().withMessage('limitOptionalInt'),
  query('page').optional().isInt().withMessage('pageOptionalInt'),
  query('search').optional().isString().withMessage('searchKeywordsOptionalString'),
  globalValidatorMiddleware,
];

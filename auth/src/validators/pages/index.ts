import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createPageValidator = [
  body('title').isString().notEmpty().withMessage('title is required'),
  body('content').isString().notEmpty().withMessage('content is required'),
  globalValidatorMiddleware,
];

export const updatePageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  body('title').optional().isString().notEmpty().withMessage('title is required'),
  body('content').optional().isString().notEmpty().withMessage('content is required'),
  globalValidatorMiddleware,
];

export const getPageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  globalValidatorMiddleware,
];

export const getPagesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be an integer'),
  globalValidatorMiddleware,
];

export const deletePageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  globalValidatorMiddleware,
];

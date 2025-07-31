import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createPageValidator = [
  body('title.ar').isString().notEmpty().withMessage('title is required'),
  body('title.en').isString().notEmpty().withMessage('title is required'),
  body('content.ar').isString().notEmpty().withMessage('content is required'),
  body('content.en').isString().notEmpty().withMessage('content is required'),
  body('type').optional().isString().withMessage('type must be a string'),
  globalValidatorMiddleware,
];

export const updatePageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  body('title.ar')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('title is required')
    .custom((value, { req }) => {
      if (!req.body.title.en) {
        throw new Error('title.en is required');
      }
      return true;
    }),
  body('title.en')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('title is required')
    .custom((value, { req }) => {
      if (!req.body.title.ar) {
        throw new Error('title.ar is required');
      }
      return true;
    }),
  body('content.ar')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('content is required')
    .custom((value, { req }) => {
      if (!req.body.content.en) {
        throw new Error('content.en is required');
      }
      return true;
    }),
  body('content.en')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('content is required')
    .custom((value, { req }) => {
      if (!req.body.content.ar) {
        throw new Error('content.ar is required');
      }
      return true;
    }),
  body('type').optional().isString().withMessage('type must be a string'),
  globalValidatorMiddleware,
];

export const getPageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  globalValidatorMiddleware,
];

export const getPagesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be an integer'),
  query('type').optional().isString().withMessage('type must be a string'),
  globalValidatorMiddleware,
];

export const deletePageValidator = [
  param('id').isMongoId().withMessage('id is required'),
  globalValidatorMiddleware,
];

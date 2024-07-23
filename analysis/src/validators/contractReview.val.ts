import { CYCLES, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const create = [
  body('comment').exists().withMessage('comment').isString().withMessage('comment'),
  body('rate').isFloat({ min: 1, max: 5 }).withMessage('rate'),
  body('contract').isMongoId().withMessage('contract'),
  body('cycle')
    .isString()
    .withMessage('cycle')
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('cycle');
    }),
  globalValidatorMiddleware,
];

export const update = [
  param('reviewId').isMongoId().withMessage('reviewId'),
  body('comment').optional().exists().withMessage('comment').isString().withMessage('comment'),
  body('rate').optional().isFloat({ min: 1, max: 5 }).withMessage('rate'),
  globalValidatorMiddleware,
];

export const getOne = [
  param('reviewId').isMongoId().withMessage('reviewId'),
  globalValidatorMiddleware,
];

export const getAll = [
  query('searchKeywords').optional().isArray({ min: 1 }).withMessage('searchKeywordsArray'),
  query('searchKeywords.*').optional().isString().withMessage('searchKeywordsString'),
  query('contract').optional().isMongoId().withMessage('contract'),
  query('sp').optional().isString().withMessage('user'),
  query('user').optional().isMongoId().withMessage('customer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit'),
  query('page').optional().isInt({ min: 1 }).withMessage('page'),
  globalValidatorMiddleware,
];

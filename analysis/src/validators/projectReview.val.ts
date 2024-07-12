import { CYCLES, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';




export const create = [
  body('comment').exists().isString(),
  body('rate').isFloat({min:1 , max:5}),
  body('project').isMongoId(),
  body('cycle').isString().custom(val => {
    if (Object.values(CYCLES).includes(val)) return true;
    throw new Error('invalid cycle');
  }),
  globalValidatorMiddleware
];

export const update = [
  param('reviewId').isMongoId(),
  body('comment').optional().exists().isString(),
  body('rate').optional().isFloat({min:1 , max:5}),
  globalValidatorMiddleware
];

export const getOne = [
  param('reviewId').isMongoId(),
  globalValidatorMiddleware
];

export const getAll = [
  query('searchKeywords')
    .optional()
    .isArray({min:1}),
  query('searchKeywords.*')
    .optional()
    .isString(),
  query('project').optional().isMongoId(),
  query('user')
    .optional()
    .isMongoId(),
  query('limit').optional().isInt({min:1}),
  query('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];
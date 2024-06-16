import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';



export const appendProducerVal = [
  body('category').isMongoId(),
  body('maxBudget').isInt(),
  body('minBudget').isInt().custom((val , {req})=>{
    if (req.body.maxBudget > val) return true;
    throw new Error('maxBudget must be greater than minBudget');
  }),
  body('searchKeywords').isArray({min:1}),
  body('searchKeywords.*').isString().exists(),
  body('subcategory').isArray({min:1}),
  body('subcategory.*').isObject(),
  body('subcategory.*.subcategory').isMongoId(),
  body('subcategory.*.tags').isArray({min:1}),
  body('subcategory.*.tags.*').isMongoId(),
  globalValidatorMiddleware
];

export const updateProducerVal = [
  param('producerId').isMongoId(),
  body('category').optional().isMongoId().custom((val,{req})=>{
    if (req.body.subcategory) return true;
    throw new Error('subcategory required');
  }),
  body('maxBudget').optional().isInt().custom((val,{req})=>{
    if (req.body.minBudget && req.body.minBudget < val) return true;
    throw new Error('minBudget required and must be less than maxBudget');
  }),
  body('minBudget').optional().isInt().custom((val,{req})=>{
    if (req.body.maxBudget && req.body.maxBudget > val) return true;
    throw new Error('minBudget required and must be gether than maxBudget');
  }),
  body('searchKeywords').optional().isArray({min:1}),
  body('searchKeywords.*').isString().exists(),
  body('subcategory').optional().isArray({min:1}).custom((val,{req})=>{
    if (req.body.category) return true;
    throw new Error('category required');
  }),
  body('subcategory.*').isObject(),
  body('subcategory.*.subcategory').isMongoId(),
  body('subcategory.*.tags').isArray({min:1}),
  body('subcategory.*.tags.*').isMongoId(),
  globalValidatorMiddleware
];

export const getProducersVal = [
  query('searchKeywords').optional().isArray().withMessage('searchKeywords must be an array of strings'),
  query('searchKeywords.*').optional().isString().withMessage('Each searchKeyword must be a string'),
  query('category').optional().isMongoId().withMessage('Category must be a string'),
  query('maxBudget').optional().isNumeric().withMessage('maxBudget must be a number'),
  query('minBudget').optional().isNumeric().withMessage('minBudget must be a number'),
  query('tags').optional().isArray().withMessage('tags must be an array of strings'),
  query('tags.*').optional().isString().withMessage('Each tag must be a string'),
  query('subCategory').optional().isString().withMessage('subCategory must be a string'),
  query('user').optional().isMongoId(),
  query('limit').optional().isInt(),
  query('page').optional().isInt(),
  globalValidatorMiddleware
];


export const getProducerVal = [
  param('producerId').isMongoId(),
  globalValidatorMiddleware
];
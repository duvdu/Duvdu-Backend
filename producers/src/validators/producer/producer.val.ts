import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const appendProducerVal = [
  body('category').isMongoId().withMessage('categoryMongoId'),
  body('maxBudget').isInt().withMessage('maxBudgetInt'),
  body('minBudget')
    .isInt()
    .custom((val, { req }) => {
      if (req.body.maxBudget > val) return true;
      throw new Error('minBudgetCustom');
    }),
  body('searchKeywords').isArray({ min: 1 }).withMessage('searchKeywordsArray'),
  body('searchKeywords.*').isString().exists().withMessage('searchKeywordsString'),
  body('subcategory').optional().isArray({ min: 1 }).withMessage('subcategoryArray'),
  body('subcategory.*.subcategory').optional().isMongoId().withMessage('subcategoryMongoId'),
  body('subcategory.*.tags').optional().isArray({ min: 1 }).withMessage('tagsArray'),
  body('subcategory.*.tags.*').isMongoId().withMessage('tagsMongoId'),
  body('platforms').optional().isArray({ min: 1 }),
  body('platforms.*').isMongoId(),
  globalValidatorMiddleware,
];

export const updateProducerVal = [
  body('category')
    .optional()
    .isMongoId(),
  body('platforms').optional().isArray({ min: 1 }),
  body('platforms.*').isMongoId(),
  body('maxBudget')
    .optional()
    .isInt()
    .custom((val, { req }) => {
      if (req.body.minBudget && req.body.minBudget < val) return true;
      throw new Error('maxBudgetOptional');
    }),
  body('minBudget')
    .optional()
    .isInt()
    .custom((val, { req }) => {
      if (req.body.maxBudget && req.body.maxBudget > val) return true;
      throw new Error('minBudgetOptional');
    }),
  body('searchKeywords').optional().isArray({ min: 1 }).withMessage('searchKeywordsOptionalArray'),
  body('searchKeywords.*').isString().exists().withMessage('searchKeywordsOptionalString'),
  body('subcategory')
    .optional()
    .isArray({ min: 1 })
    .custom((val, { req }) => {
      if (req.body.category) return true;
      throw new Error('subcategoryOptional');
    }),
  body('subcategory.*.subcategory').isMongoId().withMessage('subcategoryOptionalMongoId'),
  body('subcategory.*.tags').optional().isArray({ min: 1 }).withMessage('tagsOptionalArray'),
  body('subcategory.*.tags.*').isMongoId().withMessage('tagsOptionalMongoId'),
  globalValidatorMiddleware,
];

export const getProducersVal = [
  query('platforms').optional().isArray({ min: 1 }),
  query('platforms.*').isMongoId(),
  query('search').optional().isString().withMessage('searchKeywordsOptionalString'),
  query('category').optional().isMongoId().withMessage('categoryOptionalMongoId'),
  query('maxBudget').optional().isInt({ gt: 0 }).toInt().withMessage('maxBudgetOptionalNumeric'),
  query('minBudget').optional().isInt({ gt: 0 }).toInt().withMessage('minBudgetOptionalNumeric'),
  query('tags')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail(),
  query('subCategory')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail(),
  query('user').optional().isMongoId().withMessage('userOptionalMongoId'),
  query('limit').optional().isInt().withMessage('limitOptionalInt'),
  query('page').optional().isInt().withMessage('pageOptionalInt'),
  query('instant').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];

export const getProducerVal = [
  param('producerId').isMongoId().withMessage('producerIdMongoId'),
  globalValidatorMiddleware,
];

export const getProducerAnalysis = [
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  globalValidatorMiddleware,
];

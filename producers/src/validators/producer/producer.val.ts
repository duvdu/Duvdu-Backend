import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

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
  body('subcategory').isArray({ min: 1 }).withMessage('subcategoryArray'),
  body('subcategory.*.subcategory').isMongoId().withMessage('subcategoryMongoId'),
  body('subcategory.*.tags').isArray({ min: 1 }).withMessage('tagsArray'),
  body('subcategory.*.tags.*').isMongoId().withMessage('tagsMongoId'),
  globalValidatorMiddleware
];

export const updateProducerVal = [
  body('category')
    .optional()
    .isMongoId()
    .custom((val, { req }) => {
      if (req.body.subcategory) return true;
      throw new Error('categoryOptional');
    }),
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
  body('searchKeywords')
    .optional()
    .isArray({ min: 1 })
    .withMessage('searchKeywordsOptionalArray'),
  body('searchKeywords.*').isString().exists().withMessage('searchKeywordsOptionalString'),
  body('subcategory')
    .optional()
    .isArray({ min: 1 })
    .custom((val, { req }) => {
      if (req.body.category) return true;
      throw new Error('subcategoryOptional');
    }),
  body('subcategory.*.subcategory').isMongoId().withMessage('subcategoryOptionalMongoId'),
  body('subcategory.*.tags').isArray({ min: 1 }).withMessage('tagsOptionalArray'),
  body('subcategory.*.tags.*').isMongoId().withMessage('tagsOptionalMongoId'),
  globalValidatorMiddleware
];

export const getProducersVal = [
  query('searchKeywords').optional().isArray().withMessage('searchKeywordsOptionalArray'),
  query('searchKeywords.*').optional().isString().withMessage('searchKeywordsOptionalString'),
  query('category').optional().isMongoId().withMessage('categoryOptionalMongoId'),
  query('maxBudget').optional().isNumeric().withMessage('maxBudgetOptionalNumeric'),
  query('minBudget').optional().isNumeric().withMessage('minBudgetOptionalNumeric'),
  query('tags').optional().isArray().withMessage('tagsOptionalArray'),
  query('tags.*').optional().isString().withMessage('tagsOptionalString'),
  query('subCategory').optional().isString().withMessage('subCategoryOptionalString'),
  query('user').optional().isMongoId().withMessage('userOptionalMongoId'),
  query('limit').optional().isInt().withMessage('limitOptionalInt'),
  query('page').optional().isInt().withMessage('pageOptionalInt'),
  globalValidatorMiddleware
];

export const getProducerVal = [
  param('producerId').isMongoId().withMessage('producerIdMongoId'),
  globalValidatorMiddleware
];

import { globalValidatorMiddleware, CYCLES } from '@duvdu-v1/duvdu';
import { body, check, param } from 'express-validator';

export const createCategoryVal = [
  body('title').isObject().withMessage('title object required'),
  body('title.ar').isString().withMessage('title arabic required'),
  body('title.en').isString().withMessage('title english required'),
  body('cycle')
    .isString()
    .withMessage('cycle string required')
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalid cycle');
    }),
  body('jobTitles')
    .isArray()
    .withMessage('jobTitles must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('jobTitles.*').isObject().withMessage('jobTitles item must be an object'),
  body('jobTitles.*.ar').isString().withMessage('jobTitles arabic required'),
  body('jobTitles.*.en').isString().withMessage('jobTitles english required'),
  body('subCategories')
    .isArray()
    .withMessage('subCategories must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*').isObject().withMessage('subCategories item must be an object'),
  body('subCategories.*.title').isObject().withMessage('subCategories title object required'),
  body('subCategories.*.title.ar').isString().withMessage('subCategories arabic title required'),
  body('subCategories.*.title.en').isString().withMessage('subCategories english title required'),
  body('subCategories.*.tags')
    .isArray()
    .withMessage('subCategories tags must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*.tags.*').isObject().withMessage('subCategories tags item must be an object'),
  body('subCategories.*.tags.*.en').isString().withMessage('subCategories english tag required'),
  body('subCategories.*.tags.*.ar').isString().withMessage('subCategories arabic tag required'),
  body('status').optional().isBoolean().withMessage('status must be a boolean').bail().toBoolean(),
  globalValidatorMiddleware,
];

export const updateCategoryVal = [
  param('categoryId').isMongoId().withMessage('invalid category ID'),
  body('title')
    .optional()
    .isObject()
    .withMessage('title object required')
    .bail()
    .custom((val) => {
      if (!val.ar || !val.en) throw new Error();
      return true;
    }),
  body('title.ar').optional().isString().withMessage('title arabic required'),
  body('title.en').optional().isString().withMessage('title english required'),
  body('cycle')
    .optional()
    .isString()
    .withMessage('cycle string required')
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalid cycle');
    }),
  body('jobTitles')
    .optional()
    .isArray()
    .withMessage('jobTitles must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('jobTitles.*').isObject().withMessage('jobTitles item must be an object'),
  body('jobTitles.*.ar').isString().withMessage('jobTitles arabic required'),
  body('jobTitles.*.en').isString().withMessage('jobTitles english required'),
  body('subCategories')
    .optional()
    .isArray()
    .withMessage('subCategories must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*').isObject().withMessage('subCategories item must be an object'),
  body('subCategories.*.title').isObject().withMessage('subCategories title object required'),
  body('subCategories.*.title.ar').isString().withMessage('subCategories arabic title required'),
  body('subCategories.*.title.en').isString().withMessage('subCategories english title required'),
  body('subCategories.*.tags')
    .isArray()
    .withMessage('subCategories tags must be an array')
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*.tags.*').isObject().withMessage('subCategories tags item must be an object'),
  body('subCategories.*.tags.*.  en').isString().withMessage('subCategories english tag required'),
  body('subCategories.*.tags.*.ar').isString().withMessage('subCategories arabic tag required'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('status must be a boolean')
    .bail()
    .toBoolean(),
  globalValidatorMiddleware,
];

export const removeCategoryVal = [
  param('categoryId').isMongoId().withMessage('invalid category ID'),
  globalValidatorMiddleware,
];

export const getCatogryVal = [
  param('categoryId').isMongoId().withMessage('invalid category ID'),
  globalValidatorMiddleware,
];

export const getCategoriesForCrmVal = [
  check('search').optional().isString().notEmpty().withMessage('search must be a non-empty string'),
  check('title').optional().isString().notEmpty().withMessage('title must be a non-empty string'),
  check('cycle').optional().isString().notEmpty().withMessage('cycle must be a non-empty string'),
  check('status').optional().isBoolean().toBoolean().withMessage('status must be a boolean'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  check('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  globalValidatorMiddleware
];

export const getCategoriesVal = [
  check('search').optional().isString().notEmpty().withMessage('search must be a non-empty string'),
  check('title').optional().isString().notEmpty().withMessage('title must be a non-empty string'),
  check('cycle').optional().isString().notEmpty().withMessage('cycle must be a non-empty string'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  check('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  globalValidatorMiddleware
];


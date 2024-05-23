import { globalValidatorMiddleware, CYCLES } from '@duvdu-v1/duvdu';
import { body, check, param } from 'express-validator';

export const createCategoryVal = [
  body('title').isObject(),
  body('title.ar').isString().withMessage('title arabic required'),
  body('title.en').isString().withMessage('title englsih required'),
  body('cycle')
    .isString()
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalid cycle');
    }),
  body('jobTitles')
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('jobTitles.*').isObject(),
  body('jobTitles.*.ar').isString(),
  body('jobTitles.*.en').isString(),
  // body('tags').isArray(),
  body('subCategories')
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*').isObject(),
  body('subCategories.*.title').isObject(),
  body('subCategories.*.title.ar').isString(),
  body('subCategories.*.title.en').isString(),
  body('subCategories.*.tags')
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*.tags.*').isObject(),
  body('subCategories.*.tags.*.en').isString(),
  body('subCategories.*.tags.*.ar').isString(),
  body('status').optional().isBoolean().bail().toBoolean(),
  globalValidatorMiddleware,
];

export const updateCategoryVal = [
  param('categoryId').isMongoId(),
  body('title')
    .optional()
    .isObject()
    .bail()
    .custom((val) => {
      if (!val.ar || !val.en) throw new Error();
      return true;
    }),
  body('title.ar').optional().isString().withMessage('title arabic required'),
  body('title.en').optional().isString().withMessage('title englsih required'),
  // body('cycle').isIn([1, 2, 3, 4]).isInt().toInt(),
  body('cycle')
    .optional()
    .isString()
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalid cycle');
    }),
  body('jobTitles')
    .optional()
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('jobTitles.*').isObject(),
  body('jobTitles.*.ar').isString(),
  body('jobTitles.*.en').isString(),
  // body('tags').isArray(),
  body('subCategories')
    .optional()
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*').isObject(),
  body('subCategories.*.title').isObject(),
  body('subCategories.*.title.ar').isString(),
  body('subCategories.*.title.en').isString(),
  body('subCategories.*.tags')
    .isArray()
    .bail()
    .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
  body('subCategories.*.tags.*').isObject(),
  body('subCategories.*.tags.*.en').isString(),
  body('subCategories.*.tags.*.ar').isString(),
  body('status').optional().isBoolean().bail().toBoolean(),
  globalValidatorMiddleware,
];

export const removeCategoryVal = [param('categoryId').isMongoId(), globalValidatorMiddleware];

export const getCatogryVal = [param('categoryId').isMongoId(), globalValidatorMiddleware];

export const getCategoriesForCrmVal = [
  check('search').optional().isString().notEmpty(),
  check('title').optional().isString().notEmpty(),
  check('cycle').optional().isString().notEmpty(),
  check('status').optional().isBoolean().toBoolean(),
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];

export const getCategoriesVal = [
  check('search').optional().isString().notEmpty(),
  check('title').optional().isString().notEmpty(),
  check('cycle').optional().isString().notEmpty(),
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];

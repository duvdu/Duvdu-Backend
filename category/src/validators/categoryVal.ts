// import { globalValidatorMiddleware, CYCLES } from '@duvdu-v1/duvdu';
// import { body, check, param } from 'express-validator';

// export const createCategoryVal = [
//   body('title').isObject().withMessage('title object required'),
//   body('title.ar').isString().withMessage('title arabic required'),
//   body('title.en').isString().withMessage('title english required'),
//   body('cycle')
//     .isString()
//     .withMessage('cycle string required')
//     .bail()
//     .custom((val) => {
//       if (Object.values(CYCLES).includes(val)) return true;
//       throw new Error('invalid cycle');
//     }),
//   body('jobTitles')
//     .isArray()
//     .withMessage('jobTitles must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('jobTitles.*').isObject().withMessage('jobTitles item must be an object'),
//   body('jobTitles.*.ar').isString().withMessage('jobTitles arabic required'),
//   body('jobTitles.*.en').isString().withMessage('jobTitles english required'),
//   body('subCategories')
//     .isArray()
//     .withMessage('subCategories must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('subCategories.*').isObject().withMessage('subCategories item must be an object'),
//   body('subCategories.*.title').isObject().withMessage('subCategories title object required'),
//   body('subCategories.*.title.ar').isString().withMessage('subCategories arabic title required'),
//   body('subCategories.*.title.en').isString().withMessage('subCategories english title required'),
//   body('subCategories.*.tags')
//     .isArray()
//     .withMessage('subCategories tags must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('subCategories.*.tags.*').isObject().withMessage('subCategories tags item must be an object'),
//   body('subCategories.*.tags.*.en').isString().withMessage('subCategories english tag required'),
//   body('subCategories.*.tags.*.ar').isString().withMessage('subCategories arabic tag required'),
//   body('status').optional().isBoolean().withMessage('status must be a boolean').bail().toBoolean(),
//   globalValidatorMiddleware,
// ];

// export const updateCategoryVal = [
//   param('categoryId').isMongoId().withMessage('invalid category ID'),
//   body('title')
//     .optional()
//     .isObject()
//     .withMessage('title object required')
//     .bail()
//     .custom((val) => {
//       if (!val.ar || !val.en) throw new Error();
//       return true;
//     }),
//   body('title.ar').optional().isString().withMessage('title arabic required'),
//   body('title.en').optional().isString().withMessage('title english required'),
//   body('cycle')
//     .optional()
//     .isString()
//     .withMessage('cycle string required')
//     .bail()
//     .custom((val) => {
//       if (Object.values(CYCLES).includes(val)) return true;
//       throw new Error('invalid cycle');
//     }),
//   body('jobTitles')
//     .optional()
//     .isArray()
//     .withMessage('jobTitles must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('jobTitles.*').isObject().withMessage('jobTitles item must be an object'),
//   body('jobTitles.*.ar').isString().withMessage('jobTitles arabic required'),
//   body('jobTitles.*.en').isString().withMessage('jobTitles english required'),
//   body('subCategories')
//     .optional()
//     .isArray()
//     .withMessage('subCategories must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('subCategories.*').isObject().withMessage('subCategories item must be an object'),
//   body('subCategories.*.title').isObject().withMessage('subCategories title object required'),
//   body('subCategories.*.title.ar').isString().withMessage('subCategories arabic title required'),
//   body('subCategories.*.title.en').isString().withMessage('subCategories english title required'),
//   body('subCategories.*.tags')
//     .isArray()
//     .withMessage('subCategories tags must be an array')
//     .bail()
//     .customSanitizer((val) => (val.length === 1 && val[0] === '' ? [] : val)),
//   body('subCategories.*.tags.*').isObject().withMessage('subCategories tags item must be an object'),
//   body('subCategories.*.tags.*.  en').isString().withMessage('subCategories english tag required'),
//   body('subCategories.*.tags.*.ar').isString().withMessage('subCategories arabic tag required'),
//   body('status')
//     .optional()
//     .isBoolean()
//     .withMessage('status must be a boolean')
//     .bail()
//     .toBoolean(),
//   globalValidatorMiddleware,
// ];

// export const removeCategoryVal = [
//   param('categoryId').isMongoId().withMessage('invalid category ID'),
//   globalValidatorMiddleware,
// ];

// export const getCatogryVal = [
//   param('categoryId').isMongoId().withMessage('invalid category ID'),
//   globalValidatorMiddleware,
// ];

// export const getCategoriesForCrmVal = [
//   check('search').optional().isString().notEmpty().withMessage('search must be a non-empty string'),
//   check('title').optional().isString().notEmpty().withMessage('title must be a non-empty string'),
//   check('cycle').optional().isString().notEmpty().withMessage('cycle must be a non-empty string'),
//   check('status').optional().isBoolean().toBoolean().withMessage('status must be a boolean'),
//   check('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
//   check('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
//   globalValidatorMiddleware
// ];

// export const getCategoriesVal = [
//   check('search').optional().isString().notEmpty().withMessage('search must be a non-empty string'),
//   check('title').optional().isString().notEmpty().withMessage('title must be a non-empty string'),
//   check('cycle').optional().isString().notEmpty().withMessage('cycle must be a non-empty string'),
//   check('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
//   check('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
//   globalValidatorMiddleware
// ];

import { globalValidatorMiddleware, CYCLES } from '@duvdu-v1/duvdu';
import { body, check, param } from 'express-validator';



// Validation for creating a category
export const createCategoryVal = [
  body('title').isObject().withMessage('titleObjectRequired'),
  body('title.ar').isString().withMessage('titleArabicRequired'),
  body('title.en').isString().withMessage('titleEnglishRequired'),
  body('cycle')
    .isString()
    .withMessage('cycleStringRequired')
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalidCycle');
    }),
  body('jobTitles')
    .isArray()
    .withMessage('jobTitlesMustBeArray')
    .bail(),
  body('jobTitles.*').isObject().withMessage('jobTitlesItemMustBeObject'),
  body('jobTitles.*.ar').isString().withMessage('jobTitlesArabicRequired'),
  body('jobTitles.*.en').isString().withMessage('jobTitlesEnglishRequired'),
  body('subCategories')
    .isArray()
    .withMessage('subCategoriesMustBeArray')
    .bail(),
  body('subCategories.*').isObject().withMessage('subCategoriesItemMustBeObject'),
  body('subCategories.*.title').isObject().withMessage('subCategoriesTitleObjectRequired'),
  body('subCategories.*.title.ar').isString().withMessage('subCategoriesArabicTitleRequired'),
  body('subCategories.*.title.en').isString().withMessage('subCategoriesEnglishTitleRequired'),
  body('subCategories.*.tags')
    .isArray()
    .withMessage('subCategoriesTagsMustBeArray')
    .bail(),
  body('subCategories.*.tags.*').isObject().withMessage('subCategoriesTagsItemMustBeObject'),
  body('subCategories.*.tags.*.ar').isString().withMessage('subCategoriesArabicTagRequired'),
  body('subCategories.*.tags.*.en').isString().withMessage('subCategoriesEnglishTagRequired'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('statusMustBeBoolean')
    .bail()
    .toBoolean(),
  globalValidatorMiddleware,
];

// Validation for updating a category
export const updateCategoryVal = [
  param('categoryId').isMongoId().withMessage('invalidCategoryId'),
  body('title')
    .optional()
    .isObject()
    .withMessage('titleObjectRequired')
    .bail()
    .custom((val) => {
      if (!val.ar || !val.en) throw new Error();
      return true;
    }),
  body('title.ar').optional().isString().withMessage('titleArabicRequired'),
  body('title.en').optional().isString().withMessage('titleEnglishRequired'),
  body('cycle')
    .optional()
    .isString()
    .withMessage('cycleStringRequired')
    .bail()
    .custom((val) => {
      if (Object.values(CYCLES).includes(val)) return true;
      throw new Error('invalidCycle');
    }),
  body('jobTitles')
    .optional()
    .isArray()
    .withMessage('jobTitlesMustBeArray')
    .bail(),
  body('jobTitles.*').isObject().withMessage('jobTitlesItemMustBeObject'),
  body('jobTitles.*.ar').isString().withMessage('jobTitlesArabicRequired'),
  body('jobTitles.*.en').isString().withMessage('jobTitlesEnglishRequired'),
  body('subCategories')
    .optional()
    .isArray()
    .withMessage('subCategoriesMustBeArray')
    .bail(),
  body('subCategories.*').isObject().withMessage('subCategoriesItemMustBeObject'),
  body('subCategories.*.title').isObject().withMessage('subCategoriesTitleObjectRequired'),
  body('subCategories.*.title.ar').isString().withMessage('subCategoriesArabicTitleRequired'),
  body('subCategories.*.title.en').isString().withMessage('subCategoriesEnglishTitleRequired'),
  body('subCategories.*.tags')
    .isArray()
    .withMessage('subCategoriesTagsMustBeArray')
    .bail(),
  body('subCategories.*.tags.*').isObject().withMessage('subCategoriesTagsItemMustBeObject'),
  body('subCategories.*.tags.*.ar').isString().withMessage('subCategoriesArabicTagRequired'),
  body('subCategories.*.tags.*.en').isString().withMessage('subCategoriesEnglishTagRequired'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('statusMustBeBoolean')
    .bail()
    .toBoolean(),
  globalValidatorMiddleware,
];

// Validation for removing a category
export const removeCategoryVal = [
  param('categoryId').isMongoId().withMessage('invalidCategoryId'),
  globalValidatorMiddleware,
];

// Validation for getting a category
export const getCategoryVal = [
  param('categoryId').isMongoId().withMessage('invalidCategoryId'),
  globalValidatorMiddleware,
];

// Validation for getting categories for CRM
export const getCategoriesForCrmVal = [
  check('search').optional().isString().notEmpty().withMessage('searchMustBeNonEmptyString'),
  check('title').optional().isString().notEmpty().withMessage('titleMustBeNonEmptyString'),
  check('cycle').optional().isString().notEmpty().withMessage('cycleMustBeNonEmptyString'),
  check('status').optional().isBoolean().toBoolean().withMessage('statusMustBeBoolean'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitMustBePositiveInteger'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageMustBePositiveInteger'),
  globalValidatorMiddleware,
];

// Validation for getting categories
export const getCategoriesVal = [
  check('search').optional().isString().notEmpty().withMessage('searchMustBeNonEmptyString'),
  check('title').optional().isString().notEmpty().withMessage('titleMustBeNonEmptyString'),
  check('cycle').optional().isString().notEmpty().withMessage('cycleMustBeNonEmptyString'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitMustBePositiveInteger'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageMustBePositiveInteger'),
  globalValidatorMiddleware
];




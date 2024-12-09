import { globalValidatorMiddleware, CYCLES } from '@duvdu-v1/duvdu';
import { body, check, param } from 'express-validator';



// Validation for creating a category
export const createCategoryVal = [
  body('relatedCategory').optional().isArray().withMessage('relatedCategoryMustBeArray'),
  body('relatedCategory.*').optional().isMongoId().withMessage('relatedCategoryItemMustBeMongoId'),
  body('isRelated').optional().isBoolean().toBoolean().withMessage('isRelatedMustBeBoolean'),
  body('title').isObject().withMessage('titleObjectRequired'),
  body('title.ar').isString().withMessage('titleArabicRequired'),
  body('title.en').isString().withMessage('titleEnglishRequired'),
  body('cycle')
    .isString()
    .withMessage('cycleStringRequired')
    .bail()
    .custom((val , {req}) => {
      if (!Object.values(CYCLES).includes(val)) {
        throw new Error('invalidCycle');
      }
      if (val === CYCLES.portfolioPost && !req.body.media) {
        throw new Error('invalidmedia');
      }
      return true;
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
  body('trend').optional().isBoolean().withMessage('statusMustBeBoolean'),
  body('media').optional().isIn(['video' , 'image' , 'audio']).withMessage('invalidmedia'),
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
  body('relatedCategory').optional().isArray().withMessage('relatedCategoryMustBeArray'),
  body('relatedCategory.*').optional().isMongoId().withMessage('relatedCategoryItemMustBeMongoId'),
  body('cycle')
    .optional()
    .isString()
    .withMessage('cycleStringRequired')
    .bail()
    .custom((val , {req}) => {
      if (!Object.values(CYCLES).includes(val)) {
        throw new Error('invalidCycle');
      }
      if (val === CYCLES.portfolioPost && !req.body.media) {
        throw new Error('invalidmedia');
      }
      return true;
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
  body('trend').optional().isBoolean().withMessage('statusMustBeBoolean'),
  body('media').optional().isIn(['video' , 'image' , 'audio']).withMessage('invalidmedia'),
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
  check('isRelated').optional().isBoolean().toBoolean().withMessage('isRelatedMustBeBoolean'),
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
  check('isRelated').optional().isBoolean().toBoolean().withMessage('isRelatedMustBeBoolean'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageMustBePositiveInteger'),
  globalValidatorMiddleware
];




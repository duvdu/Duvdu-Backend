import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createCategoryVal = [
  check('title.ar').notEmpty().isString().withMessage('title arabic required'),
  check('title.en').notEmpty().isString().withMessage('title englsih required'),
  check('cycle').isIn([1, 2, 3, 4]).isInt(),
  check('jobTitles').isArray(),
  check('tags').isArray(),
  check('status')
    .optional()
    .custom((val) => {
      if ([0, 1].includes(+val)) return true;
      throw new Error('status must be value of 0 or 1');
    }),
  globalValidatorMiddleware,
];

export const updateCategoryVal = [
  check('categoryId').isMongoId(),
  check('title.ar').optional().notEmpty().isString().withMessage('title arabic required'),
  check('title.en').optional().notEmpty().isString().withMessage('title englsih required'),
  check('cycle').optional().isIn([1, 2, 3, 4]).isInt(),
  check('jobTitles').optional().isArray(),
  check('tags').optional().isArray(),
  check('status')
    .optional()
    .custom((val, { req }) => {
      req.body.status = Number(val);
      if ([0, 1].includes(Number(val))) return true;
      throw new Error('status must be value of 0 or 1');
    }),
  globalValidatorMiddleware,
];

export const removeCategoryVal = [check('categoryId').isMongoId(), globalValidatorMiddleware];

export const getCatogryVal = [check('categoryId').isMongoId(), globalValidatorMiddleware];

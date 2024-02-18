import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';


export const createCategoryVal = [
  check('title.ar').notEmpty()
    .isString().withMessage('title arabic required'),
  check('title.en').notEmpty()
    .isString().withMessage('title englsih required'), 
  check('image').custom((val,{req})=>{
    if (req.files.image) return true ;
    throw new Error();
  }),
  check('cycle').isIn([1,2,3,4]).isInt(),
  check('jobTitles').isArray(),
  check('tags').isArray(),
  globalValidatorMiddleware
];

export const updateCategoryVal = [
  check('categoryId').isMongoId(),
  check('title.ar').optional().notEmpty()
    .isString().withMessage('title arabic required'),
  check('title.en').optional().notEmpty()
    .isString().withMessage('title englsih required'), 
  check('image').optional().custom((val,{req})=>{
    if (req.files.image) return true ;
    throw new Error();
  }),
  check('cycle').optional().isIn([1,2,3,4]).isInt(),
  check('jobTitles').optional().isArray(),
  check('tags').optional().isArray(),
  globalValidatorMiddleware
];

export const removeCategoryVal = [
  check('categoryId').isMongoId(),
  globalValidatorMiddleware
];

export const getCatogryVal = [
  check('categoryId').isMongoId(),
  globalValidatorMiddleware
];
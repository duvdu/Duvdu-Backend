import { globalValidatorMiddleware, RentalUnits } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const create = [
  body('category').isMongoId(),
  body('subCategory').isMongoId(),
  body('tags').isArray(),
  body('tags.*').isMongoId(),
  body('title').isString().bail().trim().isLength({ min: 5 }),
  body('phoneNumber').isMobilePhone(['ar-EG']),
  body('email').isEmail(),
  body('description').isString().bail().trim(),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('address').isString().bail().trim(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().bail().trim().isLength({ min: 3 }),
  body('insurance').isFloat({ min: 0 }).bail().toFloat(),
  body('showOnHome').optional().isBoolean().bail().toBoolean(),
  // body('projectScale').isObject(),
  body('projectScale.unit')
    .isString()
    .bail()
    .trim()
    .custom((val) => {
      const units = Object.values(RentalUnits);
      if (units.includes(val)) return true;
      throw new Error('unit must be one of : ' + units);
    }),
  body('projectScale.minimum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.maximum').isInt({ min: 1 }).bail().toInt(),
  body('projectScale.pricerPerUnit').isFloat({ gt: 0 }).bail().toFloat(),
  globalValidatorMiddleware,
];

export const update = [
  param('projectId').isMongoId(),
  body('title').optional().isString().bail().trim().isLength({ min: 5 }),
  body('phoneNumber').optional().isMobilePhone(['ar-EG']),
  body('email').optional().isEmail(),
  body('description').optional().isString().bail().trim(),
  body('location')
    .optional()
    .isObject()
    .custom((val) => {
      if (val.lat && val.lng) return true;
      throw new Error();
    }),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('address').optional().isString().bail().trim(),
  body('searchKeywords').optional().isArray(),
  body('searchKeywords.*').isString().bail().trim().isLength({ min: 3 }),
  body('insurance').optional().isFloat({ min: 0 }).bail().toFloat(),
  body('showOnHome').optional().isBoolean().bail().toBoolean(),
  body('projectScale')
    .optional()
    .isObject()
    .custom((val) => {
      if (val.unit && val.minimum && val.maximum && val.pricerPerUnit) return true;
      throw new Error();
    }),
  body('projectScale.unit')
    .optional()
    .isString()
    .bail()
    .trim()
    .custom((val) => {
      const units = Object.values(RentalUnits);
      if (units.includes(val)) return true;
      throw new Error('unit must be one of : ' + units);
    }),
  body('projectScale.minimum').optional().isInt().bail().toInt(),
  body('projectScale.maximum').optional().isInt().bail().toInt(),
  body('projectScale.pricerPerUnit').isFloat({ min: 0 }).bail().toFloat(),
  globalValidatorMiddleware,
];

export const getOne = [param('projectId').isMongoId(), globalValidatorMiddleware];

export const getAll = [
  query('instant').optional().isBoolean().toBoolean(),
  query('searchKeywords').optional().isArray().withMessage('searchKeywords'),
  query('searchKeywords.*').optional().isString().withMessage('searchKeywords'),
  query('location.lat').optional().isNumeric().withMessage('location'),
  query('location.lng').optional().isNumeric().withMessage('location'),
  query('equipments')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => item.toString());
    }),
  query('pricePerHourFrom').optional().isFloat().bail().toFloat(),
  query('pricePerHourTo').optional().isFloat().bail().toFloat(),
  query('showOnHome').optional().isBoolean().withMessage('showOnHome').bail().toBoolean(),
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit'),
  query('page').optional().isInt({ min: 1 }).withMessage('page'),
  query('category')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  query('tags')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  query('subCategory')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.split(',') : val))
    .bail()
    .isArray()
    .custom((val) => {
      return val.every((item: string) => mongoose.Types.ObjectId.isValid(item));
    })
    .bail()
    .customSanitizer((val: string[]) => val.map((el) => new mongoose.Types.ObjectId(el))),
  globalValidatorMiddleware,
];

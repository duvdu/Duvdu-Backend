import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

import { RentalUnits } from '../models/rental.model';

export const create = [
  body('category').isMongoId(),
  body('subCategory').isMongoId(),
  body('tags').isArray(),
  body('tags.*').isString(),
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

export const getAll = [];

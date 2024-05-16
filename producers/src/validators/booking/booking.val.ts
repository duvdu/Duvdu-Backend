import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body , param, query } from 'express-validator';




export const createContractVal = [
  body('details').isString().notEmpty(),
  body('episodeduration').isInt({min:1}),
  body('episodes').isInt({min:1}),
  body('expectedbudget').isInt({min:1}),
  body('expectedprofits').isInt({min:1}),
  body('platform').isString().notEmpty(),
  body('producer').isMongoId(),
  globalValidatorMiddleware
];


export const createAppointmentVal = [
  param('contractId').isMongoId(),
  body('appoinment').isObject(),
  body('appoinment.date').isISO8601(),
  body('appoinment.address').isString().notEmpty(),
  body('appoinment.location').isObject(),
  body('appoinment.location.lat').isFloat({ min: -90, max: 90 }),
  body('appoinment.location.lng').isFloat({ min: -180, max: 180 }),
  globalValidatorMiddleware
];

export const getContractVal = [
  param('contractId').isMongoId(),
  globalValidatorMiddleware
];

export const updateContractVal = [
  param('contractId').isMongoId(),
  body('status').isIn([ 'accepted' , 'rejected' ,  'appoinment accepted' , 'appoinment rejected']),
  globalValidatorMiddleware
];

export const getContractsVal = [
  query('searchKeywords').optional().isArray(),
  query('location').optional().isObject(),
  query('location.lat').optional().isFloat(),
  query('location.lng').optional().isFloat(),
  query('platform').optional().isString(),
  query('cycle').optional().isString(),
  query('episodes').optional().isInt({ min: 0 }),
  query('episodeduration').optional().isInt({ min: 0 }),
  query('status').optional().isArray().custom(values => {
    const validStatusValues = ['pending', 'accepted', 'rejected', 'appoinment pending', 'appoinment accepted', 'appoinment rejected'];
    return values.every((value : string) => validStatusValues.includes(value));
  }),
  query('appoinmentDate').optional().isISO8601(),
  query('user').optional().isMongoId(),
  query('producer').optional().isMongoId(),
];
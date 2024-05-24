import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body , param, query } from 'express-validator';

export const createContractVal = [
  body('details').isString().notEmpty().withMessage('detailsString'),
  body('episodeduration').isInt({min:1}).withMessage('episodedurationInt'),
  body('episodes').isInt({min:1}).withMessage('episodesInt'),
  body('expectedbudget').isInt({min:1}).withMessage('expectedbudgetInt'),
  body('expectedprofits').isInt({min:1}).withMessage('expectedprofitsInt'),
  body('platform').isString().notEmpty().withMessage('platformString'),
  body('producer').isMongoId().withMessage('producerInvalid'),
  globalValidatorMiddleware
];


export const createAppointmentVal = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('appoinment').isObject(),
  body('appoinment.date').isISO8601().withMessage('appoinmentDateISO8601'),
  body('appoinment.address').isString().notEmpty(),
  body('appoinment.location').isObject(),
  body('appoinment.location.lat').isFloat({ min: -90, max: 90 }).withMessage('location.latFloat'),
  body('appoinment.location.lng').isFloat({ min: -180, max: 180 }).withMessage('location.lngFloat'),
  globalValidatorMiddleware
];

export const getContractVal = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  globalValidatorMiddleware
];

export const updateContractVal = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('status').isIn([ 'accepted' , 'rejected' ,  'appoinment accepted' , 'appoinment rejected']).withMessage('statusInvalid'),
  globalValidatorMiddleware
];

export const getContractsVal = [
  query('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  query('location').optional().isObject().withMessage('locationObject'),
  query('location.lat').optional().isFloat().withMessage('location.latFloat'),
  query('location.lng').optional().isFloat().withMessage('location.lngFloat'),
  query('platform').optional().isString().withMessage('platformString'),
  query('cycle').optional().isString().withMessage('cycleString'),
  query('episodes').optional().isInt({ min: 0 }).withMessage('episodesInt'),
  query('episodeduration').optional().isInt({ min: 0 }).withMessage('episodedurationInt'),
  query('status').optional().isArray().custom(values => {
    const validStatusValues = ['pending', 'accepted', 'rejected', 'appoinment pending', 'appoinment accepted', 'appoinment rejected'];
    return values.every((value : string) => validStatusValues.includes(value));
  }).withMessage('statusValuesInvalid'),
  query('appoinmentDate').optional().isISO8601().withMessage('appoinmentDateISO8601'),
  query('user').optional().isMongoId().withMessage('userInvalid'),
  query('producer').optional().isMongoId().withMessage('producerInvalid'),
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

import { ContractStatus } from '../../models/producerContracts.model';




export const createContractVal = [
  body('address').isString().exists(),
  body('location.lat').isFloat({ min: -90, max: 90 }),
  body('location.lng').isFloat({ min: -180, max: 180 }),
  body('appointmentDate').isISO8601().custom((val)=>{
    
    if (new Date(val) > new Date()) return true;
    throw new Error('appointmentDate must be greater than date now');
  }),
  body('episodesDuration').isInt({min:1}),
  body('episodesNumber').isInt({min:1}),
  body('expectedBudget').isInt({min:1}),
  body('expectedProfits').isInt({min:1}),
  body('platform').isString().exists(),
  body('producer').isMongoId(),
  body('projectDetails').isString().exists(),
  body('projectType').isString().exists(),
  globalValidatorMiddleware
];


export const updateContractVal = [
  param('contractId').isMongoId(),
  body('appointmentDate').optional().isISO8601().custom((val , {req})=>{
    if (req.body.status) throw new Error('status cant provided with appointmentDate');
    if (new Date(val) > new Date()) return true;
    throw new Error('appointmentDate must be greater than date now');
  }),
  body('status').optional().isIn(['canceled' , 'accepted' , 'rejected']),
  globalValidatorMiddleware
];

export const getContractsVal = [
  query('producer').optional().isMongoId(),
  query('projectType').optional().isString(),
  query('platform').optional().isString(),
  query('status').optional().isIn(Object.values(ContractStatus)),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('filter').optional().isIn(['i_created', 'i_recieved']),
  query('limit').optional().isInt({min:1}),
  query('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];

export const getContractVal = [
  param('contractId').isMongoId(),
  globalValidatorMiddleware
];

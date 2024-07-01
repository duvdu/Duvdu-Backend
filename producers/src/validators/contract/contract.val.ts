import { ContractStatus, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createContractVal = [
  body('address').isString().exists().withMessage('address.required'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('location.lat.invalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('location.lng.invalid'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('appointmentDate.invalid')
    .custom((val) => {
      if (new Date(val) > new Date()) return true;
      throw new Error('appointmentDate.past');
    }),
  body('episodesDuration').isInt({ min: 1 }).withMessage('episodesDuration.invalid'),
  body('episodesNumber').isInt({ min: 1 }).withMessage('episodesNumber.invalid'),
  body('expectedBudget').isInt({ min: 1 }).withMessage('expectedBudget.invalid'),
  body('expectedProfits').isInt({ min: 1 }).withMessage('expectedProfits.invalid'),
  body('platform').isString().exists().withMessage('platform.required'),
  body('producer').isMongoId().withMessage('producer.invalid'),
  body('projectDetails').isString().exists().withMessage('projectDetails.required'),
  globalValidatorMiddleware,
];

export const updateContractVal = [
  param('contractId').isMongoId().withMessage('contractId.invalid'),
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('appointmentDate.invalid')
    .custom((val, { req }) => {
      if (req.body.status) throw new Error('status cant provided with appointmentDate');
      if (new Date(val) > new Date()) return true;
      throw new Error('appointmentDate.past');
    }),
  body('status')
    .optional()
    .isIn(['canceled', 'accepted', 'rejected'])
    .withMessage('status.invalid'),
  globalValidatorMiddleware,
];

export const getContractsVal = [
  query('producer').optional().isMongoId().withMessage('producer.invalid'),
  query('platform').optional().isString().withMessage('platform.required'),
  query('status').optional().isIn(Object.values(ContractStatus)).withMessage('status.invalid'),
  query('startDate').optional().isISO8601().toDate().withMessage('appointmentDate.invalid'),
  query('endDate').optional().isISO8601().toDate().withMessage('appointmentDate.invalid'),
  query('filter').isIn(['i_created', 'i_received']).withMessage('filter.invalid'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit.invalid'),
  query('page').optional().isInt({ min: 1 }).withMessage('page.invalid'),
  globalValidatorMiddleware,
];

export const getContractVal = [
  param('contractId').isMongoId().withMessage('contractId.invalid'),
  globalValidatorMiddleware,
];

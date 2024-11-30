import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  param('projectId').isMongoId(),
  body('address').isString().exists(),
  body('appointmentDate')
    .isISO8601()
    .withMessage('appointmentDate.invalid')
    .custom((val) => {
      if (new Date(val) > new Date()) return true;
      throw new Error('appointmentDate in the past');
    }),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('location'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('location'),
  body('details').optional().isString(),
  body('projectScale.numberOfUnits').isInt({ min: 1 }),
  body('startDate')
    .isISO8601()
    .custom((val, { req }) => {
      if (new Date(val) < new Date()) throw new Error('startDate in the past');
      if (new Date(val) < new Date(req.body.appointmentDate))
        throw new Error('start date must be greater than appointmentDate');
      return true;
    }),
  body('equipment.tools').optional().isArray({ min: 1 }),
  body('equipment.tools.*.id').isMongoId(),
  body('equipment.functions').optional().isArray({ min: 1 }),
  body('equipment.functions.*.id').isMongoId(),
  globalValidatorMiddleware,
];

export const update = [
  param('contractId').isMongoId(),
  body('equipment.tools').optional().isArray({ min: 1 }),
  body('equipment.tools.*.id').isMongoId(),
  body('equipment.tools.*.unitPrice').isInt({ min: 1 }),
  body('equipment.tools.*.units').optional().isInt({ min: 1 }),
  body('equipment.functions').optional().isArray({ min: 1 }),
  body('equipment.functions.*.id').isMongoId(),
  body('equipment.functions.*.unitPrice').isInt({ min: 1 }),
  body('equipment.functions.*.units').optional().isInt({ min: 1 }),
  body('duration').optional().isInt({ min: 1 }),
  body('unitPrice').optional().isInt({ min: 1 }),
  body('numberOfUnits').optional().isInt({ min: 1 }),
  globalValidatorMiddleware,
];

export const action = [
  body('action')
    .isString()
    .bail()
    .custom((val) => {
      if (['reject', 'accept' , 'cancel'].includes(val)) return true;
      throw new Error();
    }),
  param('contractId').isMongoId(),
  globalValidatorMiddleware,
];

export const pay = [param('paymentSession').isString(), globalValidatorMiddleware];

export const submitFiles = [
  param('contractId').isMongoId(),
  body('link').isString(),
  body('notes').isString(),
  globalValidatorMiddleware,
];

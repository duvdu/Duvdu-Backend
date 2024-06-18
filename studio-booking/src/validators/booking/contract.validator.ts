import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  param('projectId').isMongoId(),
  body('details').isString(),
  body('projectScale.numberOfUnits').isInt({ min: 1 }),
  body('bookingDate').isString().bail().isISO8601(),
  globalValidatorMiddleware,
];

export const action = [
  body('action')
    .isString()
    .bail()
    .custom((val) => {
      if (['reject', 'accept'].includes(val)) return true;
      throw new Error();
    }),
  param('contractId').isMongoId(),
  globalValidatorMiddleware,
];

export const pay = [param('paymentSession').isString(), globalValidatorMiddleware];

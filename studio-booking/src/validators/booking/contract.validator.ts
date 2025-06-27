import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const qrCodeVerification = [param('contractId').isMongoId(), globalValidatorMiddleware];

export const create = [
  param('projectId').isMongoId(),
  body('details').optional().isString(),
  body('projectScale.numberOfUnits').isInt({ min: 1 }).toInt(),
  body('startDate')
    .isString()
    .bail()
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() < new Date().getTime()) throw new Error();
      return true;
    }),
  globalValidatorMiddleware,
];

export const action = [
  body('action')
    .isString()
    .bail()
    .custom((val) => {
      if (['reject', 'accept', 'cancel'].includes(val)) return true;
      throw new Error();
    }),
  param('contractId').isMongoId(),
  globalValidatorMiddleware,
];

export const pay = [param('contractId').isMongoId(), globalValidatorMiddleware];

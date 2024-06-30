import { BookingState, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('details').isString().withMessage('jobDetailsString'),
  body('address').isString().withMessage('addressString'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('lngInvalid'),
  body('appointmentDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error('startDateFuture');
      return true;
    }),
  body('deadline')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error('startDateFuture');
      return true;
    })
    .withMessage('startDateISO8601'),
  // body('isInstant').isBoolean().bail().toBoolean(),
  globalValidatorMiddleware,
];

export const updateProject = [
  param('bookingId').isMongoId().withMessage('bookingIdInvalid'),
  body('status')
    .isString()
    .bail()
    .custom((val) => {
      if ([BookingState.paid, BookingState.unpaid].includes(val)) return true;
      throw new Error('statusInvalid');
    })
    .withMessage('statusString'),
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

export const updateContract = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('details').optional().isString().withMessage('detailsString'),
  body('totalPrice').optional().isFloat({ gt: 0 }).withMessage('totalPrice'),
  body('deadline').optional().isISO8601().withMessage('startDateISO8601'),
  globalValidatorMiddleware,
];

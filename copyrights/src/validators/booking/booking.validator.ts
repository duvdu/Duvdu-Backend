import { BookingState, globalValidatorMiddleware, RequestedDeadlineStatus } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('details').optional().isString().withMessage('jobDetailsString'),
  body('address').isString().withMessage('addressString'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('lngInvalid'),
  body('appointmentDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error('startDateFuture');
      return true;
    }),
  body('startDate').isString().bail().isISO8601(),
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
      if (['reject', 'accept', 'cancel'].includes(val)) return true;
      throw new Error();
    }),
  param('contractId').isMongoId(),
  globalValidatorMiddleware,
];

export const pay = [param('contractId').isMongoId(), globalValidatorMiddleware];

export const updateContract = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('details').optional().isString().withMessage('detailsString'),
  body('totalPrice').optional().isFloat({ gt: 0 }).withMessage('totalPrice'),
  body('duration')
    .optional()
    .isObject()
    .bail()
    .custom((val) => {
      if (!val.value || !val.unit) throw new Error();
      return true;
    }),
  body('duration.value').optional().isInt({ gt: 0 }).bail().toInt(),
  body('duration.unit')
    .optional()
    .isString()
    .bail()
    .custom((val) => {
      if (['minutes', 'hours', 'days', 'months', 'weeks'].includes(val)) return true;
      throw new Error('durationUnit');
    }),
  globalValidatorMiddleware,
];

export const askForNewDeadline = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('deadline').isISO8601().toDate().withMessage('deadlineInvalid'),
  globalValidatorMiddleware,
];

export const respondToNewDeadline = [
  param('contractId').isMongoId().withMessage('contractIdInvalid'),
  body('status')
    .isIn([RequestedDeadlineStatus.approved, RequestedDeadlineStatus.rejected])
    .withMessage('statusInvalid'),
  globalValidatorMiddleware,
];

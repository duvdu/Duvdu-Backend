import { BookingState, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('jobDetails').isString().withMessage('jobDetailsString'),
  body('address').isString().withMessage('addressString'),
  body('location').isObject().withMessage('locationObject'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('lngInvalid'),
  body('startDate')
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

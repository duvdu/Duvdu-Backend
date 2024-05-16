import { BookingState, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId(),
  body('jobDetails').isString(),
  body('address').isString(),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('startDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error();
      return true;
    }),
  // body('isInstant').isBoolean().bail().toBoolean(),
  globalValidatorMiddleware,
];

export const updateProject = [
  param('bookingId').isMongoId(),
  body('status')
    .isString()
    .bail()
    .custom((val) => {
      if ([BookingState.paid, BookingState.unpaid].includes(val)) return true;
      throw new Error('');
    }),
  globalValidatorMiddleware,
];

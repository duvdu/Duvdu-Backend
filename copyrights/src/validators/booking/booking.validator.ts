import { BookingState, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId(),
  body('jobDetails').isString(),
  body('deadline').isISO8601(),
  body('address').isString(),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }),
  body('location.lng').isFloat({ min: -180, max: 180 }),
  // body('isInstant').isBoolean().bail().toBoolean(),
  globalValidatorMiddleware,
];

export const updateProject = [
  param('bookingId').isMongoId(),
  body('status')
    .isString()
    .bail()
    .custom((val) => {
      if (
        [
          BookingState.canceled,
          BookingState.completed,
          BookingState.ongoing,
          BookingState.rejected,
        ].includes(val)
      )
        return true;
      throw new Error('');
    }),
  globalValidatorMiddleware,
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId(),
  body('jobDetails').isString(),
  body('equipments').isArray(),
  body('equipments.*').isMongoId(),
  body('address').isString(),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }),
  body('location.lng').isFloat({ min: -180, max: 180 }),
  body('bookingHours').isInt(),
  body('appointmentDate').isISO8601(),
  body('deadline').isISO8601(),
  globalValidatorMiddleware,
];

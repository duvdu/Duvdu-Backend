import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('jobDetails').isString().withMessage('jobDetails'),
  body('equipments').isArray().withMessage('equipments'),
  body('equipments.*').isMongoId().withMessage('equipments.*'),
  body('address').isString().withMessage('address'),
  body('location').isObject().withMessage('location'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('location.lat'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('location.lng'),
  body('bookingHours').isInt().withMessage('bookingHours'),
  body('appointmentDate').isISO8601().withMessage('appointmentDate'),
  body('deadline').isISO8601().withMessage('deadline'),
  globalValidatorMiddleware,
];


import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId(),
  body('jobDetails').isString(),
  body('tools').isArray(),
  body('tools.*').isMongoId(),
  body('creatives').isArray(),
  body('creatives.*').isMongoId(),
  body('jobDetails').isString(),
  body('location').isObject(),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat(),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat(),
  body('address').isString(),
  body('numberOfHours').isInt({ min: 1 }).bail().toInt(),
  body('appointmentDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error();
      return true;
    }),
  body('startDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error();
      return true;
    }),
  body('customRequirement').isObject(),
  body('customRequirement.measure').isInt({min:1}),
  body('customRequirement.unit').isString(),
  globalValidatorMiddleware,
];

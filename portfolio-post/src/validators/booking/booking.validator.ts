import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const bookProject = [
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  body('tools').optional().isArray().withMessage('toolsArray'),
  body('tools.*').isMongoId().withMessage('toolInvalid'),
  body('creatives').optional().isArray().withMessage('creativesArray'),
  body('creatives.*').isMongoId().withMessage('creativeInvalid'),
  body('jobDetails').isString().withMessage('jobDetailsString'),
  body('location.lat').isFloat({ min: -90, max: 90 }).bail().toFloat().withMessage('latInvalid'),
  body('location.lng').isFloat({ min: -180, max: 180 }).bail().toFloat().withMessage('lngInvalid'),
  body('address').isString().withMessage('addressString'),
  body('customRequirement.measure').isInt({ min: 1 }).withMessage('measureInt'),
  body('customRequirement.unit')
    .isString()
    .custom((val) => {
      if (['minute', 'hour'].includes(val)) return true;
      throw new Error();
    }).withMessage('unitString'),
  body('shootingDays').isInt({ min: 1 }).bail().toInt().withMessage('shootingDaysInt'),
  body('appointmentDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error();
      return true;
    }).withMessage('appointmentDateISO8601'),
  body('startDate')
    .isISO8601()
    .custom((val) => {
      if (new Date(val).getTime() <= Date.now()) throw new Error();
      return true;
    }).withMessage('startDateISO8601'),
  globalValidatorMiddleware,
];

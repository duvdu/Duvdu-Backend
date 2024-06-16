import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';





export const createSettingVal = [
  body('expirationTime').isArray({min:1}),
  body('expirationTime.*').isObject(),
  body('expirationTime.*.time').isInt({min:1}),
  globalValidatorMiddleware
];


export const updateExpirationVal =[
  param('settingId').isMongoId(),
  body('expirationId').isMongoId(),
  body('time').isInt({min:1}),
  globalValidatorMiddleware
];

export const deleteExpirationVal =[
  param('settingId').isMongoId(),
  body('expirationId').isMongoId(),
  globalValidatorMiddleware
];

export const getExpirationVal =[
  param('settingId').isMongoId(),
  globalValidatorMiddleware
];

export const addExpirationVal =[
  param('settingId').isMongoId(),
  body('time').isInt({min:1}),
  globalValidatorMiddleware
];
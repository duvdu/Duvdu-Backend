import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const createSettingVal = [
  body('expirationTime').isArray({ min: 1 }).withMessage('expirationTimeArray'),
  body('expirationTime.*').isObject().withMessage('expirationTimeObject'),
  body('expirationTime.*.time').isInt({ min: 1 }).withMessage('expirationTimeInt'),
  globalValidatorMiddleware,
];

export const updateExpirationVal = [
  param('settingId').isMongoId().withMessage('settingIdMongoId'),
  body('expirationId').isMongoId().withMessage('expirationIdMongoId'),
  body('time').isInt({ min: 1 }).withMessage('timeInt'),
  globalValidatorMiddleware,
];

export const deleteExpirationVal = [
  param('settingId').isMongoId().withMessage('settingIdMongoId'),
  body('expirationId').isMongoId().withMessage('expirationIdMongoId'),
  globalValidatorMiddleware,
];

export const getExpirationVal = [
  param('settingId').isMongoId().withMessage('settingIdMongoId'),
  globalValidatorMiddleware,
];

export const addExpirationVal = [
  param('settingId').isMongoId().withMessage('settingIdMongoId'),
  body('time').isInt({ min: 1 }).withMessage('timeInt'),
  body('contractSubscriptionPercentage')
    .isInt({ min: 1, max: 100 })
    .withMessage('contractSubscriptionPercentageInt'),
  globalValidatorMiddleware,
];

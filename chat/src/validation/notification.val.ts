import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';


export const getAllNotificationVal = [
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];


export const updateOneNotificationVal = [
  check('notificationId').isMongoId(),
  globalValidatorMiddleware
];

export const getNotificationCrmVal = [
  check('sourceUser').optional().isMongoId(),
  check('targetUser').optional().isMongoId(),
  check('type').optional().isString(),
  check('target').optional().isMongoId(),
  check('watched').optional().isBoolean(),
  check('search').optional().isString(),
  check('startDate').optional().isISO8601().toDate(),
  check('endDate').optional().isISO8601().toDate(),
  globalValidatorMiddleware
];
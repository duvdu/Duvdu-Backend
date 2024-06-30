import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, check } from 'express-validator';

export const getAllNotificationVal = [
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInvalid'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInvalid'),
  globalValidatorMiddleware,
];

export const updateOneNotificationVal = [
  check('notificationId').isMongoId().withMessage('notificationIdInvalid'),
  globalValidatorMiddleware,
];

export const getNotificationCrmVal = [
  check('sourceUser').optional().isMongoId().withMessage('sourceUserInvalid'),
  check('targetUser').optional().isMongoId().withMessage('targetUserInvalid'),
  check('type').optional().isString().withMessage('typeInvalid'),
  check('target').optional().isMongoId().withMessage('targetInvalid'),
  check('watched').optional().isBoolean().withMessage('watchedInvalid'),
  check('search').optional().isString().withMessage('searchInvalid'),
  check('startDate').optional().isISO8601().toDate().withMessage('startDateInvalid'),
  check('endDate').optional().isISO8601().toDate().withMessage('endDateInvalid'),
  globalValidatorMiddleware,
];

export const sendTopicNotificationVal = [
  body('topic').isString().withMessage('topicInvalid').exists().withMessage('topicRequired'),
  body('title').isString().withMessage('titleInvalid').exists().withMessage('titleRequired'),
  body('message').isString().withMessage('messageInvalid').exists().withMessage('messageRequired'),
  globalValidatorMiddleware
];

export const sendMultiNotificationVal = [
  body('users').isArray({min:1}),
  body('users.*').isMongoId().withMessage('invalidId'),
  body('title').isString().withMessage('titleInvalid').exists().withMessage('titleRequired'),
  body('message').isString().withMessage('messageInvalid').exists().withMessage('messageRequired'),
  globalValidatorMiddleware
];
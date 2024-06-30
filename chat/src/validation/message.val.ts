import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const sendNessageVal = [
  check('content').optional().isString().isLength({ min: 1 }).withMessage('contentRequired'),
  check('receiver').isMongoId().withMessage('receiverInvalid'),
  globalValidatorMiddleware,
];

export const updateMessageVal = [
  check('message').isMongoId().withMessage('messageInvalidId'),
  check('content').optional().isString().isLength({ min: 1 }).withMessage('contentRequired'),
  check('reactions').optional().isArray({ min: 1, max: 1 }).withMessage('reactionsArray'),
  check('reactions.*.type').isString().withMessage('reactionTypeInvalid'),
  globalValidatorMiddleware,
];

export const deleteMessageVal = [
  check('message').isMongoId().withMessage('messageIdInvalid'),
  globalValidatorMiddleware,
];

export const deleteChatVal = [
  check('receiver').isMongoId().withMessage('receiverInvalid'),
  globalValidatorMiddleware,
];

export const getSpecificChatVal = [
  check('receiver').isMongoId().withMessage('receiverInvalid'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInvalid'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInvalid'),
  globalValidatorMiddleware,
];

export const getChatFromToVal = [
  check('sender').isMongoId().withMessage('receiverInvalid'),
  check('receiver').isMongoId().withMessage('receiverInvalid'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInvalid'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInvalid'),
  check('toDate').optional().isISO8601().withMessage('toDateInvalid'),
  check('fromDate').optional().isISO8601().withMessage('fromDateInvalid'),
  globalValidatorMiddleware,
];

export const markMessageAsWatchedVal = [
  check('receiver').isMongoId().withMessage('receiverInvalid'),
  check('messages').isArray({ min: 1 }).withMessage('messagesArray'),
  check('messages.*').isMongoId().withMessage('messageIdInvalid'),
  globalValidatorMiddleware,
];

export const gelLoggedUserVal = [
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInvalid'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInvalid'),
  globalValidatorMiddleware,
];

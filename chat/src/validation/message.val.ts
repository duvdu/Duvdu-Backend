import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';


export const sendNessageVal = [
  check('content').optional().isString().isLength({min:1}),
  check('receiver').isMongoId(),
  globalValidatorMiddleware
];


export const updateMessageVal = [
  check('message').isMongoId(),
  check('content').optional().isString().isLength({min:1}),
  check('reactions').optional().isArray({min:1 , max:1}),
  check('reactions.*.type').isString(),
  globalValidatorMiddleware
];


export const deleteMessageVal = [
  check('message').isMongoId(),
  globalValidatorMiddleware
];


export const deleteChatVal = [
  check('receiver').isMongoId(),
  globalValidatorMiddleware
];


export const getSpecificChatVal = [
  check('receiver').isMongoId(),
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];


export const getChatFromToVal = [
  check('sender').isMongoId(),
  check('receiver').isMongoId(),
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  check('toDate').optional().isISO8601(),
  check('fromDate').optional().isISO8601(),
  globalValidatorMiddleware
];


export const markMessageAsWatchedVal = [
  check('receiver').isMongoId(),
  check('messages').isArray({min:1}),
  check('messages.*').isMongoId(),
  globalValidatorMiddleware
];

export const gelLoggedUserVal = [
  check('limit').optional().isInt({min:1}),
  check('page').optional().isInt({min:1}),
  globalValidatorMiddleware
];
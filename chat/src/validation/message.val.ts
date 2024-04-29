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
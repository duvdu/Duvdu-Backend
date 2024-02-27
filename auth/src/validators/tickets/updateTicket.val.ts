import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';



export const updateTicket = [
  check('ticketId').isMongoId(),
  check('name').optional().isString().isLength({min:4 , max:20}),
  check('phoneNumber').optional().exists().isObject(),
  check('phoneNumber.key')
    .not()
    .exists()
    .customSanitizer(() => '+2'),
  check('phoneNumber.number').optional().exists().isString().isMobilePhone('ar-EG'),
  check('message').optional().exists().isString().isLength({min:20 , max:80}),
  globalValidatorMiddleware
];
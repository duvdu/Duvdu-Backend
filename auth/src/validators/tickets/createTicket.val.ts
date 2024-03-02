import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';



export const createTicketVal = [
  check('name').isString().isLength({min:4 , max:20}),
  check('phoneNumber').exists().isObject(),
  check('phoneNumber.key')
    .not()
    .exists()
    .customSanitizer(() => '+2'),
  check('phoneNumber.number').exists().isString().isMobilePhone('ar-EG'),
  check('message').exists().isString().isLength({min:20 , max:80}),
  check('state').not().exists(),
  globalValidatorMiddleware
];
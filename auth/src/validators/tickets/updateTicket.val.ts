import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';



export const updateTicket = [
  check('ticketId').isMongoId(),
  check('state').exists().isObject(),
  check('state.feedback').exists().isString(),
  globalValidatorMiddleware
];
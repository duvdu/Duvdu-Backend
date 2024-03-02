import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';


export const getTicketVal = [
  check('ticketId').isMongoId(),
  globalValidatorMiddleware
];
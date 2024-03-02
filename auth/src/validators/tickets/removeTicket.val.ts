import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const removeTicketVal = [check('ticketId').isMongoId(), globalValidatorMiddleware];

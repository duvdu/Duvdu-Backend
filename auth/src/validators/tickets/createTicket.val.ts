import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createTicketVal = [
  check('name').isString().isLength({ min: 4, max: 20 }).withMessage('nameLength'),
  check('phoneNumber').exists().isObject().withMessage('phoneNumberRequired'),
  check('phoneNumber.key')
    .not()
    .exists()
    .withMessage('phoneNumberKeyNotAllowed')
    .customSanitizer(() => '+2'),
  check('phoneNumber.number')
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  check('message').exists().isString().isLength({ min: 20, max: 80 }).withMessage('messageLength'),
  check('state').not().exists().withMessage('stateRequired'),
  globalValidatorMiddleware,
];

export const getTicketVal = [
  check('ticketId').isMongoId().withMessage('ticketIdInvalid'),
  globalValidatorMiddleware,
];

export const removeTicketVal = [
  check('ticketId').isMongoId().withMessage('ticketIdInvalid'),
  globalValidatorMiddleware,
];

export const updateTicket = [
  check('ticketId').isMongoId().withMessage('ticketIdInvalid'),
  check('state').exists().isObject().withMessage('stateRequired'),
  check('state.feedback').exists().isString().withMessage('feedbackRequired'),
  globalValidatorMiddleware,
];

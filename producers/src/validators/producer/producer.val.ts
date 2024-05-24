import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import {  check, param } from 'express-validator';


export const getProducerVal = [
  param('producerId').isMongoId().withMessage('producerIdInvalid'),
  globalValidatorMiddleware
];

export const getProducersVal = [
  check('limit').optional().isInt({min:1}).withMessage('limitInt'),
  check('page').optional().isInt({min:1}).withMessage('pageInt'),
  globalValidatorMiddleware
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import {  param } from 'express-validator';


export const getProducerHandler = [
  param('producerId').isMongoId(),
  globalValidatorMiddleware
];
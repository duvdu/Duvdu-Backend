import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  body('key').exists().isString().trim().isLength({ min: 2 }),
  body('title').exists().isString().trim().isLength({ min: 2 }),
  body('role').exists().isMongoId(),
  globalValidatorMiddleware,
];

export const update = [
  body('title').optional().isString().trim().isLength({ min: 2 }),
  body('status').optional().isBoolean(),
  globalValidatorMiddleware,
];

export const planId = [param('planId').isMongoId(), globalValidatorMiddleware];

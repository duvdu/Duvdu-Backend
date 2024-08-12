import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  body('key')
    .exists()
    .isString()
    .trim()
    .withMessage('keyString')
    .isLength({ min: 2 })
    .withMessage('keyLength'),
  body('title')
    .exists()
    .isString()
    .trim()
    .withMessage('titleString')
    .isLength({ min: 2 })
    .withMessage('titleLength'),
  body('role').exists().isMongoId().withMessage('roleInvalid'),
  globalValidatorMiddleware,
];

export const update = [
  param('planId').isMongoId().withMessage('planIdInvalid'),
  body('title')
    .optional()
    .isString()
    .trim()
    .withMessage('titleString')
    .isLength({ min: 2 })
    .withMessage('titleLength'),
  body('status').optional().isBoolean().withMessage('statusBoolean'),
  globalValidatorMiddleware,
];

export const planId = [
  param('planId').isMongoId().withMessage('planIdInvalid'),
  globalValidatorMiddleware,
];

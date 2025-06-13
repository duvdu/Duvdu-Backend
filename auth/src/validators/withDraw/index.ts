import { globalValidatorMiddleware, WithdrawMethod } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const createMethodValidator = [
  body('method').isIn(Object.values(WithdrawMethod)).withMessage('Method is required'),
  body('name').isString().withMessage('Name is required'),
  body('number').isString().withMessage('Number is required'),
  body('default').optional().isBoolean().withMessage('Default is required'),
  globalValidatorMiddleware,
];

export const updateMethodValidator = [
  body('id').isMongoId().withMessage('Id is required'),
  globalValidatorMiddleware,
];

export const deleteMethodValidator = [
  body('id').isMongoId().withMessage('Id is required'),
  globalValidatorMiddleware,
];

export const getMethodValidator = [
  param('id').isMongoId().withMessage('Id is required'),
  globalValidatorMiddleware,
];

export const getMethodsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page is required'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit is required'),
  globalValidatorMiddleware,
];

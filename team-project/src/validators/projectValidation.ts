import { globalPaginationMiddleware, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { body, param, query } from 'express-validator';

const parseRequestBody: RequestHandler = (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  next();
};

export const create = [
  parseRequestBody,
  body('title').exists().isString().withMessage('Title is required'),
  body('desc').exists().isString().withMessage('Description is required'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('locationLatFloat'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('locationLngFloat'),
  body('address').exists().isString(),
  body('creatives').isArray({ min: 1 }).withMessage('Creatives are required'),
  body('creatives.*.category').isMongoId().withMessage('Invalid category ID'),
  body('creatives.*.users')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Users are required for each creative'),
  body('creatives.*.users.*.user').isMongoId().withMessage('Invalid user ID'),
  body('creatives.*.users.*.duration').isInt({ min: 1 }).withMessage('Invalid duration'),
  body('creatives.*.users.*.startDate').isISO8601().withMessage('Invalid start date'),
  body('creatives.*.users.*.workHours').isInt({ min: 1 }).withMessage('Invalid workHours'),
  body('creatives.*.users.*.hourPrice').isInt({ min: 1 }).withMessage('Invalid hourPrice'),
  body('creatives.*.users.*.details').isString().withMessage('Invalid details'),
  globalValidatorMiddleware,
];

export const addCreative = [
  param('teamId').isMongoId(),
  body('user').isMongoId(),
  body('duration').isInt({ min: 1 }).withMessage('Invalid duration'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('workHours').isInt({ min: 1 }).withMessage('Invalid workHours'),
  body('hourPrice').isInt({ min: 1 }).withMessage('Invalid hourPrice'),
  body('details').isString().withMessage('Invalid details'),
  body('category').isMongoId(),
  globalValidatorMiddleware
];

export const deleteCreative = [
  param('teamId').isMongoId(),
  body('category').isMongoId(),
  body('user').isMongoId(),
  globalValidatorMiddleware
];


export const getAll = [
  query('searchKeywords').optional().isArray(),
  query('category').optional().isString(),
  query('maxBudget').optional().isNumeric(),
  query('minBudget').optional().isNumeric(),
  query('user').optional().isMongoId(),
  query('creative').optional().isMongoId(),
  query('isDeleted').optional().isBoolean().toBoolean(),
  query('limit').optional().isInt({min:1}),
  query('page').optional().isInt({min:1}),
  globalPaginationMiddleware
];

export const getOne = [
  param('teamId').isMongoId(),
  globalValidatorMiddleware
];
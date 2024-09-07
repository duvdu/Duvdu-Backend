import { globalPaginationMiddleware, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { body, param, query } from 'express-validator';

const parseRequestBody: RequestHandler = (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  next();
};

export const create = [
  parseRequestBody,
  body('title').exists().isString().withMessage('title'),
  body('desc').exists().isString().withMessage('desc'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('locationLatFloat'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('locationLngFloat'),
  body('address').exists().isString().withMessage('address'),
  body('creatives').isArray({ min: 1 }).withMessage('creatives'),
  body('creatives.*.category').isMongoId().withMessage('creativesCategory'),
  body('creatives.*.users')
    .optional()
    .isArray({ min: 1 })
    .withMessage('creativesUsers'),
  body('creatives.*.users.*.user').isMongoId().withMessage('creativesUsersUser'),
  body('creatives.*.users.*.duration').isInt({ min: 1 }).withMessage('creativesUsersDuration'),
  body('creatives.*.users.*.startDate').isISO8601().withMessage('creativesUsersStartDate'),
  body('creatives.*.users.*.workHours').isInt({ min: 1 }).withMessage('creativesUsersWorkHours'),
  body('creatives.*.users.*.hourPrice').isInt({ min: 1 }).withMessage('creativesUsersHourPrice'),
  body('creatives.*.users.*.details').isString().withMessage('creativesUsersDetails'),
  globalValidatorMiddleware,
];

export const addCreative = [
  param('teamId').isMongoId().withMessage('teamId'),
  body('user').isMongoId().withMessage('user'),
  body('duration').isInt({ min: 1 }).withMessage('duration'),
  body('startDate').isISO8601().withMessage('startDate'),
  body('workHours').isInt({ min: 1 }).withMessage('workHours'),
  body('hourPrice').isInt({ min: 1 }).withMessage('hourPrice'),
  body('details').isString().withMessage('details'),
  body('category').isMongoId().withMessage('category'),
  globalValidatorMiddleware
];

export const deleteCreative = [
  param('teamId').isMongoId().withMessage('teamId'),
  body('category').isMongoId().withMessage('category'),
  body('user').isMongoId().withMessage('user'),
  globalValidatorMiddleware
];

export const getAll = [
  query('search').optional().isString().withMessage('searchKeywords'),
  query('category').optional().isString().withMessage('category'),
  query('maxBudget').optional().isNumeric().withMessage('maxBudget'),
  query('minBudget').optional().isNumeric().withMessage('minBudget'),
  query('user').optional().isMongoId().withMessage('user'),
  query('creative').optional().isMongoId().withMessage('creative'),
  query('isDeleted').optional().isBoolean().toBoolean().withMessage('isDeleted'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit'),
  query('page').optional().isInt({ min: 1 }).withMessage('page'),
  globalPaginationMiddleware
];

export const getOne = [
  param('teamId').isMongoId().withMessage('teamId'),
  globalValidatorMiddleware
];


export const action = [
  body('action')
    .isString()
    .bail()
    .custom((val) => {
      if (['reject', 'accept'].includes(val)) return true;
      throw new Error();
    }),
  param('contractId').isMongoId(),
  globalValidatorMiddleware,
];

export const pay = [param('paymentSession').isString(), globalValidatorMiddleware];
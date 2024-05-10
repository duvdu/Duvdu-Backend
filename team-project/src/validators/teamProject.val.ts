import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';


export const createProjectVal = [
  body('title').trim().isString().notEmpty(),
  body('category').isMongoId(),
  body('budget').isInt({min:1}),
  body('desc').trim().isString().notEmpty(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('address').trim().isString().notEmpty(),
  body('shootingDays').isInt({min:1}),
  body('startDate').isISO8601().toDate(),
  body('creatives').isArray(),
  body('creatives.*').isObject(),
  body('creatives.*.jobTitle').isString().notEmpty(),
  body('creatives.*.users').isArray({min:1}),
  body('creatives.*.users.*').isObject(),
  body('creatives.*.users.*.user').isMongoId(),
  body('creatives.*.users.*.workHours').isInt({min:1}),
  body('creatives.*.users.*.totalAmount').isInt({min:1}),
  body('showOnHome').isBoolean(),
  globalValidatorMiddleware
];

export const updateProjectVal = [
  param('projectId').isMongoId(),
  body('title').optional().trim().isString().notEmpty(),
  body('budget').optional().isInt({min:1}),
  body('desc').optional().trim().isString().notEmpty(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('address').optional().trim().isString().notEmpty(),
  body('shootingDays').optional().isInt({min:1}),
  body('startDate').optional().isISO8601().toDate(),
  body('showOnHome').optional().isBoolean(),
  globalValidatorMiddleware
];

export const deleteProjectVal = [
  param('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const getProjectVal = [
  param('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const actionTeamProjectVal = [
  param('projectId').isMongoId(),
  body('category').isMongoId(),
  body('status').isBoolean(),
  globalValidatorMiddleware
];

export const deleteCreativeVal = [
  param('projectId').isMongoId(),
  body('user').isMongoId(),
  body('category').isMongoId(),
  globalValidatorMiddleware
];


export const getProjectsVal = [
  query('searchKeywords').optional().isArray(),
  query('location.lat').optional().isFloat({ min: -90, max: 90 }),
  query('location.lng').optional().isFloat({ min: -180, max: 180 }),
  query('category').optional().isMongoId(),
  query('pricePerHourFrom').optional().isInt({min:1}),
  query('pricePerHourTo').optional().isInt({min:1}),
  query('showOnHome').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('user').optional().isMongoId(),
  globalValidatorMiddleware
];

export const projectAnalysisVal = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  globalValidatorMiddleware
];

export const updateCreativeVal = [
  param('projectId').isMongoId(),
  body('user').isMongoId(),
  body('category').isMongoId(),
  body('workHours').optional().isInt({min:1}),
  body('totalAmount').optional().isInt({min:1}),
  globalValidatorMiddleware
];
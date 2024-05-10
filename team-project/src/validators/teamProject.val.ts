import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, check } from 'express-validator';


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
  globalValidatorMiddleware
];

export const updateProjectVal = [
  body('projectId').isMongoId(),
  body('title').optional().trim().isString().notEmpty(),
  body('budget').optional().isInt({min:1}),
  body('desc').optional().trim().isString().notEmpty(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('address').optional().trim().isString().notEmpty(),
  body('shootingDays').optional().isInt({min:1}),
  body('startDate').optional().isISO8601().toDate(),
  globalValidatorMiddleware
];

export const deleteProjectVal = [
  check('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const getProjectHandler = [
  check('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const actionTeamProjectVal = [
  check('projectId').isMongoId(),
  check('category').isMongoId(),
  check('accept').isBoolean(),
  globalValidatorMiddleware
];
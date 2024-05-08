import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';




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
  body('creatives').isArray({min:1}),
  body('creatives.*.jobTitle').trim().isString().notEmpty(),
  body('creatives.*.users').isArray({min:1}),
  body('creatives.*.users.*.user').isMongoId(),
  body('creatives.*.users.*.workHours').isInt({min:1}),
  body('creatives.*.users.*.totalAmount').isInt({min:1}),
  globalValidatorMiddleware
];

export const updateProjectVal = [
  body('projectId').isMongoId(),
  body('title').trim().isString().notEmpty(),
  body('category').isMongoId(),
  body('budget').isInt({min:1}),
  body('desc').trim().isString().notEmpty(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('address').trim().isString().notEmpty(),
  body('shootingDays').isInt({min:1}),
  body('startDate').isISO8601().toDate(),
  globalValidatorMiddleware
];
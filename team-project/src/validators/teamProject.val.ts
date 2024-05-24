import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';


// export const createProjectVal = [
//   body('title').trim().isString().notEmpty(),
//   body('budget').isInt({min:1}),
//   body('desc').trim().isString().notEmpty(),
//   body('location.lat').optional().isFloat({ min: -90, max: 90 }),
//   body('location.lng').optional().isFloat({ min: -180, max: 180 }),
//   body('address').trim().isString().notEmpty(),
//   body('shootingDays').isInt({min:1}),
//   body('startDate').isISO8601().toDate(),
//   body('creatives').isArray(),
//   body('creatives.*').isObject(),
//   body('creatives.*.category').isMongoId(),
//   body('creatives.*.users').optional().isArray({min:1}),
//   body('creatives.*.users.*').isObject(),
//   body('creatives.*.users.*.user').isMongoId(),
//   body('creatives.*.users.*.workHours').isInt({min:1}),
//   body('creatives.*.users.*.totalAmount').isInt({min:1}),
//   globalValidatorMiddleware
// ];

// export const updateProjectVal = [
//   param('projectId').isMongoId(),
//   body('title').optional().trim().isString().notEmpty(),
//   body('budget').optional().isInt({min:1}),
//   body('desc').optional().trim().isString().notEmpty(),
//   body('location.lat').optional().isFloat({ min: -90, max: 90 }),
//   body('location.lng').optional().isFloat({ min: -180, max: 180 }),
//   body('address').optional().trim().isString().notEmpty(),
//   body('shootingDays').optional().isInt({min:1}),
//   body('startDate').optional().isISO8601().toDate(),
//   globalValidatorMiddleware
// ];

// export const deleteProjectVal = [
//   param('projectId').isMongoId(),
//   globalValidatorMiddleware
// ];

// export const getProjectVal = [
//   param('projectId').isMongoId(),
//   globalValidatorMiddleware
// ];

// export const actionTeamProjectVal = [
//   param('projectId').isMongoId(),
//   body('craetiveScope').isMongoId(),
//   body('status').isBoolean(),
//   globalValidatorMiddleware
// ];

// export const deleteCreativeVal = [
//   param('projectId').isMongoId(),
//   body('user').isMongoId(),
//   body('craetiveScope').isMongoId(),
//   globalValidatorMiddleware
// ];


// export const getProjectsVal = [
//   query('searchKeywords').optional().isArray(),
//   query('location.lat').optional().isFloat({ min: -90, max: 90 }),
//   query('location.lng').optional().isFloat({ min: -180, max: 180 }),
//   query('category').optional().isMongoId(),
//   query('pricePerHourFrom').optional().isInt({min:1}),
//   query('pricePerHourTo').optional().isInt({min:1}),
//   query('startDate').optional().isISO8601(),
//   query('endDate').optional().isISO8601(),
//   query('user').optional().isMongoId(),
//   query('limit').optional().isInt({min:1}),
//   query('page').optional().isInt({min:1}),
//   globalValidatorMiddleware
// ];

// export const projectAnalysisVal = [
//   query('startDate').optional().isISO8601().toDate(),
//   query('endDate').optional().isISO8601().toDate(),
//   globalValidatorMiddleware
// ];

// export const updateCreativeVal = [
//   param('projectId').isMongoId(),
//   body('user').isMongoId(),
//   body('craetiveScope').isMongoId(),
//   body('workHours').optional().isInt({min:1}),
//   body('totalAmount').optional().isInt({min:1}),
//   globalValidatorMiddleware
// ];

// export const addCreativeVal = [
//   param('projectId').isMongoId(),
//   body('user').isMongoId(),
//   body('craetiveScope').isMongoId(),
//   body('workHours').isInt({min:1}),
//   body('totalAmount').isInt({min:1}),
//   globalValidatorMiddleware
// ];


export const createProjectVal = [
  body('title').trim().isString().notEmpty().withMessage('title'),
  body('budget').isInt({ min: 1 }).withMessage('budget'),
  body('desc').trim().isString().notEmpty().withMessage('desc'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('location.lat'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('location.lng'),
  body('address').trim().isString().notEmpty().withMessage('address'),
  body('shootingDays').isInt({ min: 1 }).withMessage('shootingDays'),
  body('startDate').isISO8601().toDate().withMessage('startDate'),
  body('creatives').isArray().withMessage('creatives'),
  body('creatives.*').isObject().withMessage('creatives.*'),
  body('creatives.*.category').isMongoId().withMessage('creatives.*.category'),
  body('creatives.*.users').optional().isArray({ min: 1 }).withMessage('creatives.*.users'),
  body('creatives.*.users.*').isObject().withMessage('creatives.*.users.*'),
  body('creatives.*.users.*.user').isMongoId().withMessage('creatives.*.users.*.user'),
  body('creatives.*.users.*.workHours').isInt({ min: 1 }).withMessage('creatives.*.users.*.workHours'),
  body('creatives.*.users.*.totalAmount').isInt({ min: 1 }).withMessage('creatives.*.users.*.totalAmount'),
  globalValidatorMiddleware
];

export const updateProjectVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('title').optional().trim().isString().notEmpty().withMessage('title'),
  body('budget').optional().isInt({ min: 1 }).withMessage('budget'),
  body('desc').optional().trim().isString().notEmpty().withMessage('desc'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('location.lat'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('location.lng'),
  body('address').optional().trim().isString().notEmpty().withMessage('address'),
  body('shootingDays').optional().isInt({ min: 1 }).withMessage('shootingDays'),
  body('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  globalValidatorMiddleware
];

export const deleteProjectVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  globalValidatorMiddleware
];

export const getProjectVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  globalValidatorMiddleware
];

export const actionTeamProjectVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('craetiveScope').isMongoId().withMessage('craetiveScope'),
  body('status').isBoolean().withMessage('status'),
  globalValidatorMiddleware
];

export const deleteCreativeVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('user').isMongoId().withMessage('user'),
  body('craetiveScope').isMongoId().withMessage('craetiveScope'),
  globalValidatorMiddleware
];

export const getProjectsVal = [
  query('searchKeywords').optional().isArray().withMessage('searchKeywords'),
  query('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('location.lat'),
  query('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('location.lng'),
  query('category').optional().isMongoId().withMessage('category'),
  query('pricePerHourFrom').optional().isInt({ min: 1 }).withMessage('pricePerHourFrom'),
  query('pricePerHourTo').optional().isInt({ min: 1 }).withMessage('pricePerHourTo'),
  query('startDate').optional().isISO8601().withMessage('startDate'),
  query('endDate').optional().isISO8601().withMessage('endDate'),
  query('user').optional().isMongoId().withMessage('user'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit'),
  query('page').optional().isInt({ min: 1 }).withMessage('page'),
  globalValidatorMiddleware
];

export const projectAnalysisVal = [
  query('startDate').optional().isISO8601().toDate().withMessage('startDate'),
  query('endDate').optional().isISO8601().toDate().withMessage('endDate'),
  globalValidatorMiddleware
];

export const updateCreativeVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('user').isMongoId().withMessage('user'),
  body('craetiveScope').isMongoId().withMessage('craetiveScope'),
  body('workHours').optional().isInt({ min: 1 }).withMessage('workHours'),
  body('totalAmount').optional().isInt({ min: 1 }).withMessage('totalAmount'),
  globalValidatorMiddleware
];

export const addCreativeVal = [
  param('projectId').isMongoId().withMessage('projectId'),
  body('user').isMongoId().withMessage('user'),
  body('craetiveScope').isMongoId().withMessage('craetiveScope'),
  body('workHours').isInt({ min: 1 }).withMessage('workHours'),
  body('totalAmount').isInt({ min: 1 }).withMessage('totalAmount'),
  globalValidatorMiddleware
];

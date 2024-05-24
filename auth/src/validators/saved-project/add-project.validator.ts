import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const addProject = [
  param('bookmarkId').isMongoId().withMessage('bookmarkIdInvalid'),
  param('projectId').isMongoId().withMessage('projectIdInvalid'),
  globalValidatorMiddleware,
];

export const createBookmark = [
  body('title').isString().bail().isLength({ min: 1 }).withMessage('titleString'),
  body('projects').isArray().withMessage('projectsArray'),
  body('projects.*').isMongoId().withMessage('projectInvalid'),
  globalValidatorMiddleware,
];

export const bookmarkParam = [
  param('bookmarkId').isMongoId().withMessage('bookmarkIdInvalid'),
  query('limit').optional().isInt({min:1}).withMessage('limitInteger'),
  query('page').optional().isInt({min:1}).withMessage('pageInteger'),
  globalValidatorMiddleware
];

export const updateBookmark = [
  param('bookmarkId').isMongoId().withMessage('bookmarkIdInvalid'),
  body('title').exists().isString().trim().isLength({ min: 1 }).withMessage('titleString'),
  globalValidatorMiddleware,
];

import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const addProject = [
  param('bookmarkId').isMongoId(),
  param('projectId').isMongoId(),
  globalValidatorMiddleware,
];

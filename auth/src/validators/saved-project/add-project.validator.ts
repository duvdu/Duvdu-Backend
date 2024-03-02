import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const addProject = [
  param('savedProjectId').isMongoId(),
  param('projectId').isMongoId(),
  globalValidatorMiddleware,
];

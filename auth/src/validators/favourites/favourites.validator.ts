import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const projectParam = [param('projectId').isMongoId(), globalValidatorMiddleware];

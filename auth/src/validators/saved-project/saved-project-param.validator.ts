import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param } from 'express-validator';

export const bookmarkParam = [param('bookmarkId').isMongoId(), globalValidatorMiddleware];

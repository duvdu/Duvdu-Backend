import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { param, query } from 'express-validator';

export const favourites = [
  param('projectId').isMongoId(),
  query('action')
    .optional()
    .custom((val) => {
      if (['add', 'remove'].includes(val)) return true;
      throw new Error('action must be add or remove');
    }),
  globalValidatorMiddleware,
];

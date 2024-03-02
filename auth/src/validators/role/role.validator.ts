import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

import { Ifeatures } from '../../types/Features';

export const create = [
  body('key').exists().isString().trim().isLength({ min: 2 }),
  body('features').exists().isArray({ min: 1 }),
  body('features.*').custom((val) => {
    if (Object.values(Ifeatures).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }),
  globalValidatorMiddleware,
];

export const update = [
  body('features').exists().isArray({ min: 1 }),
  body('features.*').custom((val) => {
    if (Object.values(Ifeatures).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }),
  globalValidatorMiddleware,
];

export const roleId = [param('roleId').isMongoId(), globalValidatorMiddleware];

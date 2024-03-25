import { globalValidatorMiddleware, PERMISSIONS } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';


export const create = [
  body('key').exists().isString().trim().isLength({ min: 2 }),
  body('features').exists().isArray({ min: 1 }),
  body('features.*').custom((val) => {
    if (Object.values(PERMISSIONS).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }),
  globalValidatorMiddleware,
];

export const update = [
  body('features').exists().isArray({ min: 1 }),
  body('features.*').custom((val) => {
    if (Object.values(PERMISSIONS).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }),
  globalValidatorMiddleware,
];

export const roleId = [param('roleId').isMongoId(), globalValidatorMiddleware];

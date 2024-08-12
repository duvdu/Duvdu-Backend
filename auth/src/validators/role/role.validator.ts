import { globalValidatorMiddleware, PERMISSIONS } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const create = [
  body('key').exists().isString().trim().isLength({ min: 2 }).withMessage('keyLength'),
  body('permissions').exists().isArray({ min: 1 }).withMessage('featuresArrayLength'),
  body('permissions.*')
    .custom((val) => {
      if (Object.values(PERMISSIONS).includes(val)) return true;
      throw new Error(`${val} not a permission`);
    })
    .withMessage('featureInvalid'),
  globalValidatorMiddleware,
];

export const update = [
  param('roleId').isMongoId(),
  body('permissions').exists().isArray({ min: 1 }).withMessage('featuresArrayLength'),
  body('permissions.*')
    .custom((val) => {
      if (Object.values(PERMISSIONS).includes(val)) return true;
      throw new Error(`${val} not a permission`);
    })
    .withMessage('featureInvalid'),
  globalValidatorMiddleware,
];

export const roleId = [
  param('roleId').isMongoId().withMessage('roleIdInvalid'),
  globalValidatorMiddleware,
];

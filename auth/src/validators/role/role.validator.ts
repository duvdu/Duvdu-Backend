import { globalValidatorMiddleware, PERMISSIONS } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';



export const create = [
  body('key').exists().isString().trim().isLength({ min: 2 }).withMessage('keyLength'),
  body('features').exists().isArray({ min: 1 }).withMessage('featuresArrayLength'),
  body('features.*').custom((val) => {
    if (Object.values(PERMISSIONS).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }).withMessage('featureInvalid'),
  globalValidatorMiddleware,
];

export const update = [
  body('features').exists().isArray({ min: 1 }).withMessage('featuresArrayLength'),
  body('features.*').custom((val) => {
    if (Object.values(PERMISSIONS).includes(val)) return true;
    throw new Error(`${val} not a feature`);
  }).withMessage('featureInvalid'),
  globalValidatorMiddleware,
];

export const roleId = [param('roleId').isMongoId().withMessage('roleIdInvalid'), globalValidatorMiddleware];


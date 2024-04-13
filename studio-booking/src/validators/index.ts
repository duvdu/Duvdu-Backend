import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';



export const createProjectVal = [
  check('studioName').isString().isLength({min:5}),
  check('studioNumber').isMobilePhone(['ar-EG']),
  check('studioEmail').isEmail(),
  check('desc').isString().isLength({min:10}),
  check('location.lat').isFloat({ min: -90, max: 90 }),
  check('location.lng').isFloat({ min: -180, max: 180 }),
  check('searchKeywords').optional().isArray(),
  check('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  check('pricePerHour').isFloat({min:1}),
  check('insurance').isFloat({min:1}),
  check('showOnHome').isBoolean().toBoolean(),
  check('category').isMongoId(),
  check('equipments').isArray({ min: 1 }),
  check('equipments.*.name').isString(),
  check('equipments.*.fees').isFloat({min:1}),
  globalValidatorMiddleware
];

export const updateProjectVal = [
  check('projectId').isMongoId(),
  check('studioName').optional().isString().isLength({min:5}),
  check('studioNumber').optional().isMobilePhone(['ar-EG']),
  check('studioEmail').optional().isEmail(),
  check('desc').optional().isString().isLength({min:10}),
  check('location.lat').optional().isFloat({ min: -90, max: 90 }),
  check('location.lng').optional().isFloat({ min: -180, max: 180 }),
  check('searchKeywords').optional().optional().isArray(),
  check('searchKeywords.*').optional().isString().trim().isLength({ min: 3 }),
  check('pricePerHour').optional().isFloat({min:1}),
  check('insurance').optional().isFloat({min:1}),
  check('showOnHome').optional().isBoolean().toBoolean(),
  check('category').not().exists(),
  check('equipments').not().exists(),
  globalValidatorMiddleware
];

export const updateEquipmentVal = [
  check('equipmentId').isMongoId(),
  check('projectId').isMongoId(),
  check('name').isString(),
  check('fees').isFloat({min:1}),
  globalValidatorMiddleware
];

export const deleteEquipmentVal = [
  check('equipmentId').isMongoId(),
  check('projectId').isMongoId(),
  globalValidatorMiddleware
];

export const addEquipmentVal = [
  check('projectId').isMongoId(),
  check('name').isString(),
  check('fees').isFloat({min:1}),
  globalValidatorMiddleware
];

export const deleteProjectVal = [
  check('projectId').isMongoId(),
  globalValidatorMiddleware
];

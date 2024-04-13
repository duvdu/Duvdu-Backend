import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createProjectVal = [
  check('studioName').isString().isLength({ min: 5 }),
  check('studioNumber').isMobilePhone(['ar-EG']),
  check('studioEmail').isEmail(),
  check('desc').isString().isLength({ min: 10 }),
  check('location.lat').isFloat({ min: -90, max: 90 }),
  check('location.lng').isFloat({ min: -180, max: 180 }),
  check('searchKeywords').optional().isArray(),
  check('searchKeywords.*').isString().trim().isLength({ min: 3 }),
  check('pricePerHour').isFloat({ gt: 0 }).toFloat(),
  check('insurance').isFloat({ gt: 0 }).toFloat(),
  check('showOnHome').isBoolean().toBoolean(),
  check('category').isMongoId(),
  check('equipments').isArray({ min: 1 }),
  check('equipments.*.name').isString(),
  check('equipments.*.fees').isFloat({ gt: 0 }).toFloat(),
  check('creatives').optional().isArray(),
  check('creatives.*.creative').isMongoId(),
  check('creatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  check('invitedCreatives').optional().isArray(),
  check('invitedCreatives.*.phoneNumber').isObject(),
  check('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG'),
  check('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  globalValidatorMiddleware,
];

export const updateProjectVal = [
  check('projectId').isMongoId(),
  check('studioName').optional().isString().isLength({ min: 5 }),
  check('studioNumber').optional().isMobilePhone(['ar-EG']),
  check('studioEmail').optional().isEmail(),
  check('desc').optional().isString().isLength({ min: 10 }),
  check('location.lat').optional().isFloat({ min: -90, max: 90 }),
  check('location.lng').optional().isFloat({ min: -180, max: 180 }),
  check('searchKeywords').optional().optional().isArray(),
  check('searchKeywords.*').optional().isString().trim().isLength({ min: 3 }),
  check('pricePerHour').optional().isFloat({ gt: 0 }).toFloat(),
  check('insurance').optional().isFloat({ gt: 0 }).toFloat(),
  check('showOnHome').optional().isBoolean().toBoolean(),
  check('creatives').optional().isArray(),
  check('creatives.*.creative').isMongoId(),
  check('creatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  check('invitedCreatives').optional().isArray(),
  check('invitedCreatives.*.phoneNumber').isObject(),
  check('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG'),
  check('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat(),
  check('category').not().exists(),
  check('equipments').not().exists(),
  globalValidatorMiddleware,
];

export const updateEquipmentVal = [
  check('equipmentId').isMongoId(),
  check('projectId').isMongoId(),
  check('name').isString(),
  check('fees').isFloat({ gt: 0 }).toFloat(),
  globalValidatorMiddleware,
];

export const deleteEquipmentVal = [
  check('equipmentId').isMongoId(),
  check('projectId').isMongoId(),
  globalValidatorMiddleware,
];

export const addEquipmentVal = [
  check('projectId').isMongoId(),
  check('name').isString(),
  check('fees').isFloat({ gt: 0 }).toFloat(),
  globalValidatorMiddleware,
];

export const deleteProjectVal = [check('projectId').isMongoId(), globalValidatorMiddleware];

export const getAllProjectsVal = [
  check('searchKeywords').optional().isArray(),
  check('location.lat').optional().isNumeric(),
  check('location.lng').optional().isNumeric(),
  check('equipments').optional().isArray(),
  check('category').optional().isString(),
  check('pricePerHourFrom').optional().isNumeric(),
  check('pricePerHourTo').optional().isNumeric(),
  check('insurance').optional().isNumeric(),
  check('showOnHome').optional().isBoolean(),
  check('startDate').optional().isISO8601(),
  check('endDate').optional().isISO8601(),
  globalValidatorMiddleware,
];

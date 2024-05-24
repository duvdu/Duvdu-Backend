import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createProjectVal = [
  check('studioName').isString().withMessage('studioNameString').isLength({ min: 5 }).withMessage('studioNameMinLength'),
  check('studioNumber').isMobilePhone(['ar-EG']).withMessage('studioNumberInvalid'),
  check('studioEmail').isEmail().withMessage('studioEmailInvalid'),
  check('desc').isString().withMessage('descString').isLength({ min: 10 }).withMessage('descMinLength'),
  check('location.lat').isFloat({ min: -90, max: 90 }).withMessage('locationLatFloat'),
  check('location.lng').isFloat({ min: -180, max: 180 }).withMessage('locationLngFloat'),
  check('searchKeywords').optional().isArray().withMessage('searchKeywordsArray'),
  check('searchKeywords.*').isString().trim().isLength({ min: 3 }).withMessage('searchKeywordsMinLength'),
  check('pricePerHour').isFloat({ gt: 0 }).toFloat().withMessage('pricePerHourFloat'),
  check('insurance').isFloat({ gt: 0 }).toFloat().withMessage('insuranceFloat'),
  check('showOnHome').isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  check('category').isMongoId().withMessage('categoryInvalid'),
  check('equipments').isArray({ min: 1 }).withMessage('equipmentsMinLength'),
  check('equipments.*.name').isString().withMessage('equipmentNameString'),
  check('equipments.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('equipmentFeesFloat'),
  check('creatives').optional().isArray().withMessage('creativesArray'),
  check('creatives.*.creative').isMongoId().withMessage('creativeInvalid'),
  check('creatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('creativeFeesFloat'),
  check('invitedCreatives').optional().isArray().withMessage('invitedCreativesArray'),
  check('invitedCreatives.*.phoneNumber').isObject().withMessage('invitedCreativesPhoneNumberObject'),
  check('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG').withMessage('invitedCreativesPhoneNumberInvalid'),
  check('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('invitedCreativesFeesFloat'),
  check('tags').isArray().withMessage('tagsArray'),
  check('tags.*').isString().trim().isLength({ min: 3 }).withMessage('tagsMinLength'),
  check('subCategory').isMongoId().withMessage('subCategoryInvalid'),
  globalValidatorMiddleware,
];

export const updateProjectVal = [
  check('projectId').isMongoId().withMessage('projectIdInvalid'),
  check('studioName').optional().isString().withMessage('studioNameString').isLength({ min: 5 }).withMessage('studioNameMinLength'),
  check('studioNumber').optional().isMobilePhone(['ar-EG']).withMessage('studioNumberInvalid'),
  check('studioEmail').optional().isEmail().withMessage('studioEmailInvalid'),
  check('desc').optional().isString().withMessage('descString').isLength({ min: 10 }).withMessage('descMinLength'),
  check('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('locationLatFloat'),
  check('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('locationLngFloat'),
  check('searchKeywords').optional().optional().isArray().withMessage('searchKeywordsArray'),
  check('searchKeywords.*').optional().isString().trim().isLength({ min: 3 }).withMessage('searchKeywordsMinLength'),
  check('pricePerHour').optional().isFloat({ gt: 0 }).toFloat().withMessage('pricePerHourFloat'),
  check('insurance').optional().isFloat({ gt: 0 }).toFloat().withMessage('insuranceFloat'),
  check('showOnHome').optional().isBoolean().toBoolean().withMessage('showOnHomeBoolean'),
  check('creatives').optional().isArray().withMessage('creativesArray'),
  check('creatives.*.creative').isMongoId().withMessage('creativeInvalid'),
  check('creatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('creativeFeesFloat'),
  check('invitedCreatives').optional().isArray().withMessage('invitedCreativesArray'),
  check('invitedCreatives.*.phoneNumber').isObject().withMessage('invitedCreativesPhoneNumberObject'),
  check('invitedCreatives.*.phoneNumber.number').isMobilePhone('ar-EG').withMessage('invitedCreativesPhoneNumberInvalid'),
  check('invitedCreatives.*.fees').isFloat({ gt: 0 }).toFloat().withMessage('invitedCreativesFeesFloat'),
  check('category').not().exists().withMessage('categoryNotExists'),
  check('equipments').not().exists().withMessage('equipmentsNotExists'),
  globalValidatorMiddleware,
];

export const updateEquipmentVal = [
  check('equipmentId').isMongoId().withMessage('equipmentIdInvalid'),
  check('projectId').isMongoId().withMessage('projectIdInvalid'),
  check('name').isString().withMessage('nameString'),
  check('fees').isFloat({ gt: 0 }).toFloat().withMessage('feesFloat'),
  globalValidatorMiddleware,
];

export const deleteEquipmentVal = [
  check('equipmentId').isMongoId().withMessage('equipmentIdInvalid'),
  check('projectId').isMongoId().withMessage('projectIdInvalid'),
  globalValidatorMiddleware,
];

export const addEquipmentVal = [
  check('projectId').isMongoId().withMessage('addProjectId'),
  check('name').isString().withMessage('nameString'),
  check('fees').isFloat({ gt: 0 }).toFloat().withMessage('feesFloat'),
  globalValidatorMiddleware,
];

export const deleteProjectVal = [
  check('projectId').isMongoId().withMessage('deleteProjectId'),
  globalValidatorMiddleware,
];

export const getAllProjectsVal = [
  check('searchKeywords').optional().isArray().withMessage('searchKeywords'),
  check('location.lat').optional().isNumeric().withMessage('locationLatNumeric'),
  check('location.lng').optional().isNumeric().withMessage('locationLngNumeric'),
  check('equipments').optional().isArray().withMessage('equipmentsArray'),
  check('category').optional().isString().withMessage('categoryString'),
  check('pricePerHourFrom').optional().isNumeric().withMessage('pricePerHourFromNumeric'),
  check('pricePerHourTo').optional().isNumeric().withMessage('pricePerHourToNumeric'),
  check('insurance').optional().isNumeric().withMessage('insuranceNumeric'),
  check('showOnHome').optional().isBoolean().withMessage('showOnHomeBoolean'),
  check('startDate').optional().isISO8601().withMessage('startDateISO8601'),
  check('endDate').optional().isISO8601().withMessage('endDateISO8601'),
  check('tags').optional().isString().withMessage('tagsString'),
  check('subCategory').optional().isString().withMessage('subCategoryString'),
  check('limit').optional().isInt({ min: 1 }).withMessage('limitInt'),
  check('page').optional().isInt({ min: 1 }).withMessage('pageInt'),
  globalValidatorMiddleware,
];


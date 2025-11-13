import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const signupVal = [
  body('name').isString().trim().isLength({ min: 3, max: 32 }).withMessage('nameInvalid'),
  body('email').isEmail().withMessage('invalidEmail'),
  body('phoneNumber').isObject(),
  body('phoneNumber.number')
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('username')
    .isString()
    .isLength({ min: 6, max: 32 })
    .withMessage('lengthBetween')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage('passwordInvalid'),
  body('notificationToken').optional().isString(),
  globalValidatorMiddleware,
];

export const createUser = [
  body('name').isString().trim().isLength({ min: 3, max: 32 }).withMessage('nameInvalid'),
  body('email').isEmail().withMessage('invalidEmail'),
  body('phoneNumber').isObject(),
  body('phoneNumber.number')
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('username')
    .isString()
    .isLength({ min: 6, max: 32 })
    .withMessage('lengthBetween')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  body('password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage('passwordInvalid'),
  body('role').isMongoId(),
  globalValidatorMiddleware,
];

export const getCrmUser = [param('userId').isMongoId(), globalValidatorMiddleware];

export const updateUser = [
  param('userId').isMongoId(),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('nameInvalid'),
  body('phoneNumber').isObject().optional(),
  body('categories').optional().isArray(),
  body('categories.*').isMongoId(),
  body('phoneNumber.number')
    .optional()
    .exists()
    .isString()
    .isMobilePhone('ar-EG')
    .withMessage('phoneNumberInvalid'),
  body('username')
    .optional()
    .isString()
    .isLength({ min: 6, max: 32 })
    .withMessage('lengthBetween')
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  body('password')
    .optional()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage('passwordInvalid'),
  body('email').optional().isEmail().withMessage('invalidEmail'),
  body('address').optional().exists().isString().withMessage('invalidAddress'),
  body('avaliableContracts')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage('invalidAvaliableContracts'),
  body('role').optional().isMongoId(),
  globalValidatorMiddleware,
];

export const blockUser = [
  param('userId').isMongoId(),
  body('reason').isString().exists({ checkFalsy: true }),
  globalValidatorMiddleware,
];

export const unblockUser = [param('userId').isMongoId(), globalValidatorMiddleware];

export const loginProvider = [
  body('email').optional().isEmail().withMessage('invalidEmail'),
  body('googleId')
    .optional()
    .isString()
    .exists()
    .custom((val, { req }) => {
      if (req.body.appleId) throw new Error('can not provide apple and google id');
      return true;
    }),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('nameInvalid'),
  body('appleId')
    .optional()
    .isString()
    .exists()
    .custom((val, { req }) => {
      if (req.body.googleId) throw new Error('can not provide apple and google id');
      return true;
    }),
  body('notificationToken').optional().isString(),
  body('username')
    .optional()
    .isString()
    .custom((val, { req }) => {
      if (!req.body.appleId && !req.body.googleId) {
        throw new Error('either appleId or googleId must be provided when username is included');
      }
      return true;
    }),
  globalValidatorMiddleware,
];

export const deleteUser = [param('userId').isMongoId(), globalValidatorMiddleware];

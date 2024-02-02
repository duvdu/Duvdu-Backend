import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const signupVal = [
  body('name').exists().isString().trim().isLength({ min: 3, max: 32 }),
  body('phoneNumber').exists().isObject(),
  body('phoneNumber.key')
    .not()
    .exists()
    .customSanitizer(() => '+2'),
  body('phoneNumber.number').exists().isString().isMobilePhone('ar-EG'),
  body('username')
    .exists()
    .isString()
    .isLength({ min: 6, max: 32 })
    .custom((val) => {
      if (val.match(/^[a-zA-Z0-9_]+$/)) return true;
      throw new Error('');
    }),
  body('password')
    .exists()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }),
  body('googleId').not().exists(),
  body('appleId').not().exists(),
  body('verificationCode').not().exists(),
  body('isVerified').not().exists(),
  body('token').not().exists(),
  body('profileImage').not().exists(),
  body('coverImage').not().exists(),
  body('location').not().exists(),
  body('category').not().exists(),
  body('acceptedProjectsCounter').not().exists(),
  body('profileViews').not().exists(),
  body('about').not().exists(),
  body('isOnline').not().exists(),
  body('isAvaliableToInstantProjects').not().exists(),
  body('pricePerHour').not().exists(),
  body('plan').not().exists(),
  body('hasVerificationPadge').not().exists(),
  body('avaliableContracts').not().exists(),
  body('rate').not().exists(),
  body('isBlocked').not().exists(),
  globalValidatorMiddleware,
];
